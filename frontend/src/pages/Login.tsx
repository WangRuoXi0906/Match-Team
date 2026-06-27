import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('请填写完整信息');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }
      
      localStorage.setItem('token', data.token);
      // 获取已保存的用户数据，保留之前填写的学校、年级等信息
      const existingUser = localStorage.getItem('user');
      const existingUserData = existingUser ? JSON.parse(existingUser) : {};
      localStorage.setItem('user', JSON.stringify({
        ...existingUserData,
        ...data.user,
        studentId: data.user.username || existingUserData.studentId || '',
        school: existingUserData.school || '未填写',
        grade: existingUserData.grade || '未填写',
        major: existingUserData.major || '未填写',
        skills: existingUserData.skills || []
      }));
      navigate('/competitions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      let response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@example.com', password: '123456' }),
      });
      
      let data = await response.json();
      
      if (!response.ok) {
        if (data.message === '邮箱或密码错误') {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              username: 'admin', 
              email: 'admin@example.com', 
              password: '123456',
              name: '管理员'
            }),
          });
          
          response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'admin@example.com', password: '123456' }),
          });
          data = await response.json();
        } else {
          throw new Error(data.message || '登录失败');
        }
      }
      
      localStorage.setItem('token', data.token);
      // 获取已保存的用户数据，保留之前填写的信息
      const existingUser = localStorage.getItem('user');
      const existingUserData = existingUser ? JSON.parse(existingUser) : {};
      localStorage.setItem('user', JSON.stringify({
        ...existingUserData,
        ...data.user,
        studentId: data.user.username || existingUserData.studentId || '',
        school: existingUserData.school || '清华大学',
        grade: existingUserData.grade || '2021级',
        major: existingUserData.major || '计算机科学与技术',
        skills: existingUserData.skills || ['前端开发', '算法设计', '项目管理']
      }));
      navigate('/competitions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-blue-100">校园竞赛组队平台</p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-fadeIn">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              还没有账号？立即注册
            </Link>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button 
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
            >
              管理员快捷登录 (admin@example.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
