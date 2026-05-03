import React from 'react';
import {
  CalendarCheck,
  CreditCard,
  MapPin,
  Scissors,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';

const CrystalGraphic: React.FC = () => {
  return (
    <div className="relative mx-auto h-[360px] w-[360px]" aria-hidden="true">
      <div className="absolute left-1/2 top-[86%] h-12 w-64 -translate-x-1/2 rounded-full bg-brand-900/10 blur-2xl" />
      <div className="absolute left-1/2 top-[83%] h-5 w-40 -translate-x-1/2 animate-shadow-pulse rounded-full bg-brand-900/15 blur-md" />

      <div className="absolute inset-0 animate-float [perspective:1000px]">
        <div className="absolute left-1/2 top-[48%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-gradient-to-br from-white/85 via-blush-100 to-brand-200 shadow-[0_34px_70px_rgba(168,52,61,0.2)] [transform:rotateX(58deg)_rotateZ(-38deg)]" />
        <div className="absolute left-[27%] top-[22%] h-52 w-52 rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-blush-50 to-brand-100 shadow-[0_24px_58px_rgba(95,29,36,0.16)] [transform:rotateX(14deg)_rotateY(-18deg)_rotateZ(-6deg)]">
          <div className="absolute inset-x-5 top-5 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-button">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">
              Live
            </div>
          </div>

          <div className="absolute left-5 right-5 top-20">
            <div className="h-3 w-28 rounded-full bg-brand-900/18" />
            <div className="mt-3 h-2 w-36 rounded-full bg-brand-900/10" />
            <div className="mt-2 h-2 w-24 rounded-full bg-brand-900/10" />
          </div>

          <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/80 p-3 shadow-input">
              <CalendarCheck className="h-4 w-4 text-brand-600" />
              <div className="mt-3 h-2 w-14 rounded-full bg-brand-900/16" />
              <div className="mt-2 h-2 w-10 rounded-full bg-brand-900/10" />
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-input">
              <CreditCard className="h-4 w-4 text-gold-700" />
              <div className="mt-3 h-2 w-12 rounded-full bg-brand-900/16" />
              <div className="mt-2 h-2 w-8 rounded-full bg-brand-900/10" />
            </div>
          </div>
        </div>

        <div className="absolute left-[3%] top-[34%] flex w-40 items-center gap-3 rounded-3xl border border-white/70 bg-white/85 p-3 shadow-[0_20px_46px_rgba(168,52,61,0.16)] backdrop-blur [transform:rotateZ(-8deg)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blush-200 text-brand-700">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-20 rounded-full bg-brand-900/18" />
            <div className="mt-2 h-2 w-14 rounded-full bg-brand-900/10" />
            <div className="mt-2 flex gap-1 text-gold-500">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className="h-3 w-3 fill-current" />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute right-[2%] top-[28%] w-40 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_20px_46px_rgba(168,52,61,0.16)] backdrop-blur [transform:rotateZ(9deg)]">
          <div className="flex items-center gap-2 text-brand-700">
            <MapPin className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wide">Nearby</span>
          </div>
          <div className="mt-4 h-20 rounded-2xl bg-[linear-gradient(90deg,rgba(168,52,61,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(184,147,79,0.1)_1px,transparent_1px)] bg-[size:18px_18px]">
            <div className="relative h-full">
              <span className="absolute left-[28%] top-[35%] h-3 w-3 rounded-full bg-brand-600 shadow-[0_0_0_5px_rgba(168,52,61,0.16)]" />
              <span className="absolute left-[68%] top-[52%] h-3 w-3 rounded-full bg-gold-500 shadow-[0_0_0_5px_rgba(184,147,79,0.18)]" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-[11%] right-[14%] flex items-center gap-3 rounded-3xl border border-white/70 bg-brand-700 px-5 py-4 text-white shadow-[0_24px_50px_rgba(130,37,45,0.24)] [transform:rotateZ(-5deg)]">
          <Search className="h-5 w-5" />
          <div>
            <div className="h-2.5 w-24 rounded-full bg-white/70" />
            <div className="mt-2 h-2 w-16 rounded-full bg-white/35" />
          </div>
        </div>

        <div className="absolute bottom-[18%] left-[15%] rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-brand-800 shadow-[0_18px_38px_rgba(95,29,36,0.14)] backdrop-blur [transform:rotateZ(6deg)]">
          ₹1.8k booked
        </div>
      </div>
    </div>
  );
};

export default CrystalGraphic;
