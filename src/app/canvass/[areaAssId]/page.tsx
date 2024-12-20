import 'leaflet/dist/leaflet.css';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import CanvassPage from 'features/canvass/components/CanvassPage';
import BackendApiClient from 'core/api/client/BackendApiClient';
import { ZetkinOrganization } from 'utils/types/zetkin';

interface PageProps {
  params: {
    areaAssId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { areaAssId } = params;
  const headersList = headers();
  const headersEntries = headersList.entries();
  const headersObject = Object.fromEntries(headersEntries);
  const apiClient = new BackendApiClient(headersObject);

  try {
    await apiClient.get<ZetkinOrganization>(`/api/users/me`);

    return <CanvassPage areaAssId={areaAssId} />;
  } catch (err) {
    return redirect(`/login?redirect=/canvass/${areaAssId}`);
  }
}
