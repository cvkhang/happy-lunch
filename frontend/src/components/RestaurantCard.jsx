import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../utils/distance';

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="flex flex-col md:flex-row md:h-56 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group">
      {/* Image Section */}
      <div className="w-full md:w-1/3 h-48 md:h-auto relative overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors">
          <svg className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full md:w-2/3 flex flex-col p-4">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
              {restaurant.distance !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {formatDistance(restaurant.distance)}
                </span>
              )}
            </div>
          </div>

          {/* Address Field */}
          <div className="flex items-center text-slate-500 text-xs mb-2">
            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 mr-2 text-base">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(restaurant.rating) ? 'text-yellow-400' : 'text-slate-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="font-bold text-slate-700 mr-1 text-sm">{restaurant.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-slate-400 text-xs">({restaurant.Reviews?.length || 0} 件の評価)</span>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          <div className="space-y-1 min-h-[2.5rem]">
            {restaurant.Reviews && restaurant.Reviews.length > 0 ? (
              restaurant.Reviews.slice(0, 2).map((review, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-orange-400 mr-1 mt-0.5 text-sm">❝</span>
                  <p className="text-slate-600 text-xs italic line-clamp-1">{review.comment || review}</p>
                </div>
              ))
            ) : (
              <div className="flex items-start">
                <p className="text-slate-400 text-xs italic">まだレビューがありません。</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/restaurant/${restaurant.id}`} className="block w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold text-center py-2 rounded-xl shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all text-sm">
            詳細を見たいですか
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
