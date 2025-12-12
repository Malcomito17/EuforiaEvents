import { Star } from 'lucide-react';
const SIZES = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
};
export function StarRating({ rating, size = 'md', showNumber = false, className = '' }) {
    return (<div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`${SIZES[size]} ${star <= rating
                ? 'fill-amber-500 text-amber-500'
                : 'fill-gray-300 text-gray-300'}`}/>))}
      {showNumber && (<span className="text-xs text-gray-600 ml-1">{rating}/5</span>)}
    </div>);
}
//# sourceMappingURL=StarRating.js.map