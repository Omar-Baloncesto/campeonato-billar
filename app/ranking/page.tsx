import { fetchRankingFinal, fetchRankingGroups } from '../lib/sheets';
import RankingClient from './RankingClient';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const [rankingFinal, rankingGroups] = await Promise.all([
    fetchRankingFinal(),
    fetchRankingGroups(),
  ]);
  return <RankingClient rankingFinal={rankingFinal} rankingGroups={rankingGroups} />;
}
