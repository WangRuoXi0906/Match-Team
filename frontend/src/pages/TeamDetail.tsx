import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Team { _id: string; name: string; description: string; leader: any; members: any[]; competition: any; tags: any[]; }

const TeamDetail = () => {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/teams/${id}`).then(res => {
      setTeam(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">加载中...</div>;
  if (!team) return <div className="flex justify-center items-center h-screen">队伍不存在</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
        <p className="text-gray-600 mb-6">{team.description}</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">队伍标签</h3>
          <div className="flex flex-wrap gap-2">
            {team.tags?.map(t => <span key={t._id} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">{t.name}</span>)}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">所属竞赛</h3>
          <p className="text-gray-600">{team.competition?.title || '未关联竞赛'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">队长</h3>
          <div className="flex items-center">
            <img src={team.leader?.avatar || 'https://via.placeholder.com/100'} alt={team.leader?.name} className="h-12 w-12 rounded-full mr-4" />
            <div>
              <p className="font-medium">{team.leader?.name}</p>
              <p className="text-sm text-gray-500">{team.leader?.username}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">成员列表</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.members?.map(m => (
              <div key={m._id} className="flex items-center">
                <img src={m.avatar || 'https://via.placeholder.com/100'} alt={m.name} className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-md">申请加入</button>
      </div>
    </div>
  );
};

export default TeamDetail;