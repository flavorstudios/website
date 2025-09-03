import AdminCommentsPageClient from './AdminCommentsPageClient';
import { serverEnv } from '@/env/server';

export default function AdminCommentsPage() {
  return <AdminCommentsPageClient apiKey={serverEnv.ADMIN_API_KEY} />;
}