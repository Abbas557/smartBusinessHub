import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';

const profileSchema = z.object({
  name: z.string().min(2).max(100),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: { name: string }) => axiosInstance.patch('/users/me', data),
    onSuccess: () => toast.success('Profile updated!'),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Update failed'),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordFormValues) => axiosInstance.post('/users/me/change-password', data),
    onSuccess: () => { toast.success('Password changed!'); passwordForm.reset(); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <form onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))} className="space-y-4">
          <Input label="Full Name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
          <Input label="Email" type="email" value={user?.email || ''} disabled helperText="Email cannot be changed" />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateProfile.isPending}>Save</Button>
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))} className="space-y-4">
          <Input label="Current Password" type="password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} />
          <Input label="New Password"     type="password" {...passwordForm.register('newPassword')}     error={passwordForm.formState.errors.newPassword?.message} />
          <Input label="Confirm Password" type="password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} />
          <div className="flex justify-end">
            <Button type="submit" isLoading={changePassword.isPending}>Update Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
