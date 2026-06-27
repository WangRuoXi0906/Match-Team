import { Link } from 'react-router-dom';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center">
              竞赛平台
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/competitions" className="border-indigo-500 text-gray-900 px-1 pt-1 border-b-2 text-sm font-medium">
                竞赛
              </Link>
              <Link to="/teams" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium">
                队伍
              </Link>
              <Link to="/recruitments" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium">
                招募
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="ml-3">
                <Link to="/profile" className="flex items-center">
                  <img src={user.avatar || 'https://via.placeholder.com/100'} alt={user.name} className="h-8 w-8 rounded-full" />
                </Link>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                  登录
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;