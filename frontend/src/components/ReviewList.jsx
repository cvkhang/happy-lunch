import React, { useState, useMemo } from 'react';
import ImageModal from './ImageModal';
import ReviewItem from './ReviewItem';

const ReviewList = ({ reviews, onReviewUpdated, readOnlyLikes = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);

  // Collect all images for the gallery
  const allImages = useMemo(() => {
    const images = [];
    if (reviews) {
      reviews.forEach(review => {
        if (Array.isArray(review.image_urls) && review.image_urls.length > 0) {
          images.push(...review.image_urls);
        } else if (review.image_url) {
          images.push(review.image_url);
        }
      });
    }
    return images;
  }, [reviews]);

  const openGallery = (url) => {
    const index = allImages.indexOf(url);
    if (index !== -1) {
      setInitialSlide(index);
      setIsModalOpen(true);
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500">レビューはまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onReviewUpdated={onReviewUpdated}
          readOnlyLikes={readOnlyLikes}
          openGallery={openGallery}
        />
      ))}

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          images={allImages}
          initialIndex={initialSlide}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ReviewList;
