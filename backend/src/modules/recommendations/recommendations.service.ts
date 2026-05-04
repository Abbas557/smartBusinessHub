import { Injectable } from '@nestjs/common';
import { BusinessDao } from '../business/dao/business.dao';
import { BusinessDocument } from '../business/business.schema';
import { CustomerProfileDao } from '../customer-profiles/dao/customer-profile.dao';
import { CustomerEventDao } from '../customer-events/dao/customer-event.dao';
import { CustomerEventDocument, CustomerEventType } from '../customer-events/customer-event.schema';

type RecommendationQuery = {
  city?: string;
  area?: string;
  pincode?: string;
  placeId?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
  sessionId?: string;
};

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly businessDao: BusinessDao,
    private readonly customerProfileDao: CustomerProfileDao,
    private readonly customerEventDao: CustomerEventDao,
  ) {}

  async getPublicRecommendations(query: RecommendationQuery) {
    const [base, eventSections] = await Promise.all([
      this.buildRecommendations(query),
      this.buildEventSections({ query, sessionId: query.sessionId }),
    ]);

    return {
      ...base,
      strategy: 'events-plus-rules-v1',
      sections: [...eventSections, ...base.sections],
    };
  }

  async getCustomerRecommendations(userId: string, query: RecommendationQuery) {
    const profile = await this.customerProfileDao.findByUserId(userId);
    const coordinates = profile?.location?.coordinates;
    const enrichedQuery = {
      ...query,
      city: query.city || profile?.city,
      area: query.area || profile?.area,
      pincode: query.pincode || profile?.pincode,
      lng: query.lng || (coordinates?.[0] !== undefined ? String(coordinates[0]) : undefined),
      lat: query.lat || (coordinates?.[1] !== undefined ? String(coordinates[1]) : undefined),
    };

    const [base, eventSections] = await Promise.all([
      this.buildRecommendations(enrichedQuery),
      this.buildEventSections({
        query: enrichedQuery,
        userId,
        sessionId: query.sessionId,
      }),
    ]);
    const savedBusinesses = profile?.savedBusinessIds?.length
      ? await this.businessDao.findPublishedByIds(
          profile.savedBusinessIds.map((id) => id.toString()),
        )
      : [];

    const savedCategories = [
      ...new Set(savedBusinesses.map((business) => business.category)),
    ];

    const becauseYouSaved = savedCategories.length
      ? await this.businessDao.findPublished(
          { category: { $in: savedCategories } },
          'top-rated',
        )
      : [];

    return {
      ...base,
      strategy: 'events-plus-rules-v1',
      sections: [
        ...eventSections,
        ...(savedBusinesses.length
          ? [
              this.createSection(
                'saved-vendors',
                'Saved vendors',
                'Your shortcuts back to businesses you liked.',
                savedBusinesses,
              ),
            ]
          : []),
        ...(becauseYouSaved.length
          ? [
              this.createSection(
                'because-you-saved',
                'Because of your saved picks',
                'Similar categories ranked by rating, bookings, and freshness.',
                becauseYouSaved,
              ),
            ]
          : []),
        ...base.sections,
      ],
    };
  }

  private async buildRecommendations(query: RecommendationQuery) {
    const locationFilter = this.buildLocationFilter(query);
    const [nearby, topRated, mostBooked, salons, repairs, trendingIds] = await Promise.all([
      this.findNearbyOrFallback(query, locationFilter),
      this.businessDao.findPublished(locationFilter, 'top-rated'),
      this.businessDao.findPublished(locationFilter, 'most-booked'),
      this.businessDao.findPublished({ ...locationFilter, category: 'salon' }, 'top-rated'),
      this.businessDao.findPublished({ ...locationFilter, category: 'repair' }, 'most-booked'),
      this.customerEventDao.findTrendingBusinessIds({
        city: query.city,
        area: query.area,
        pincode: query.pincode,
      }),
    ]);
    const trending = trendingIds.length
      ? await this.businessDao.findPublishedByIds(trendingIds)
      : [];

    return {
      generatedAt: new Date().toISOString(),
      strategy: 'rule-based-v1',
      sections: [
        this.createSection(
          'trending-locally',
          query.area ? `Trending around ${query.area}` : 'Trending locally',
          'Vendors getting recent views, saves, booking intent, and bookings.',
          this.orderByIds(trending, trendingIds),
        ),
        this.createSection(
          'near-you',
          query.area ? `Recommended near ${query.area}` : 'Recommended near you',
          'Balanced by location fit, service coverage, bookings, and rating quality.',
          nearby,
        ),
        this.createSection(
          'top-rated',
          'Top rated locally',
          'Businesses with the strongest public review signal.',
          topRated,
        ),
        this.createSection(
          'most-booked',
          'Most booked services',
          'Popular vendors customers are booking again and again.',
          mostBooked,
        ),
        this.createSection(
          'self-care',
          'Self-care picks',
          'Beauty and grooming vendors that are easy to compare and book.',
          salons,
        ),
        this.createSection(
          'quick-help',
          'Quick help at home',
          'Repair vendors ranked for booking momentum and nearby relevance.',
          repairs,
        ),
      ].filter((section) => section.businesses.length > 0),
    };
  }

  private async buildEventSections(params: {
    query: RecommendationQuery;
    userId?: string;
    sessionId?: string;
  }) {
    const events = await this.customerEventDao.findRecentSignals({
      userId: params.userId,
      sessionId: params.sessionId,
      limit: 80,
    });
    if (events.length === 0) return [];

    const viewedBusinessIds = this.latestUnique(
      events
        .filter((event) =>
          [
            CustomerEventType.VIEW_BUSINESS,
            CustomerEventType.BOOKING_INTENT,
            CustomerEventType.SAVE_BUSINESS,
          ].includes(event.eventType),
        )
        .map((event) => event.businessId?.toString())
        .filter(Boolean) as string[],
    );
    const viewedBusinesses = viewedBusinessIds.length
      ? await this.businessDao.findPublishedByIds(viewedBusinessIds)
      : [];

    const categories = this.latestUnique(
      events
        .map((event) => event.category)
        .filter(Boolean) as string[],
    );
    const categoryMatches = categories.length
      ? await this.businessDao.findPublished(
          {
            ...this.buildLocationFilter(params.query),
            category: { $in: categories },
          },
          'top-rated',
        )
      : [];

    const searchTerms = this.latestUnique(
      events
        .filter((event) => event.eventType === CustomerEventType.SEARCH)
        .map((event) => event.query)
        .filter((query) => query && query.trim().length >= 2) as string[],
    );
    const searchMatches = searchTerms.length
      ? await this.businessDao.findPublished(
          {
            ...this.buildLocationFilter(params.query),
            $or: this.buildSearchConditions(searchTerms.slice(0, 3)),
          },
          'top-rated',
        )
      : [];

    return [
      this.createSection(
        'recently-viewed',
        'Pick up where you left off',
        'Businesses you recently viewed, saved, or started booking.',
        this.orderByIds(viewedBusinesses, viewedBusinessIds),
      ),
      this.createSection(
        'based-on-explored-categories',
        'Based on categories you explored',
        'More vendors from the service categories you clicked and booked around.',
        categoryMatches,
      ),
      this.createSection(
        'based-on-recent-searches',
        'Based on your recent searches',
        'Search intent matched against vendor names, descriptions, and services.',
        searchMatches,
      ),
    ].filter((section) => section.businesses.length > 0);
  }

  private async findNearbyOrFallback(
    query: RecommendationQuery,
    fallbackFilter: Record<string, any>,
  ) {
    const lat = this.parseCoordinate(query.lat);
    const lng = this.parseCoordinate(query.lng);
    if (lat !== null && lng !== null) {
      return this.businessDao.findPublishedNearby({
        filter: fallbackFilter,
        lat,
        lng,
        radiusKm: this.parseRadiusKm(query.radiusKm),
        sort: 'nearest',
      }) as any;
    }

    return this.businessDao.findPublished(fallbackFilter, 'most-booked');
  }

  private createSection(
    id: string,
    title: string,
    subtitle: string,
    businesses: BusinessDocument[],
  ) {
    return {
      id,
      title,
      subtitle,
      businesses: this.uniqueBusinesses(businesses).slice(0, 8),
    };
  }

  private uniqueBusinesses(businesses: BusinessDocument[]) {
    const seen = new Set<string>();
    return businesses.filter((business) => {
      const id = business.id || business._id?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  private orderByIds(businesses: BusinessDocument[], ids: string[]) {
    const rank = new Map(ids.map((id, index) => [id, index]));
    return [...businesses].sort((a, b) => {
      const aId = a.id || a._id?.toString();
      const bId = b.id || b._id?.toString();
      return (rank.get(aId) ?? 999) - (rank.get(bId) ?? 999);
    });
  }

  private latestUnique(values: string[]) {
    const seen = new Set<string>();
    return values.filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  private buildSearchConditions(searchTerms: string[]) {
    return searchTerms.flatMap((term) => {
      const search = { $regex: term, $options: 'i' };
      return [
        { name: search },
        { description: search },
        { city: search },
        { area: search },
        { 'services.name': search },
      ];
    });
  }

  private buildLocationFilter(query: RecommendationQuery) {
    const filter: Record<string, any> = {};
    if (query.city) filter.city = { $regex: query.city, $options: 'i' };
    if (query.area) filter.area = { $regex: query.area, $options: 'i' };
    if (query.pincode) filter.pincode = query.pincode;
    return filter;
  }

  private parseCoordinate(value?: string): number | null {
    if (value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseRadiusKm(value?: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 25;
    return Math.min(Math.max(parsed, 1), 100);
  }
}
