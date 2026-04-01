export default function EvokeLogo({ size = 46, className = "" }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Center Dot (Anı Kapsülü) */}
            <circle cx="50" cy="54" r="6" fill="currentColor" />
            
            {/* Top Dot (Kafa - Büyütüldü) */}
            <circle cx="50" cy="18" r="6.5" fill="currentColor" />
            
            {/* Left Arm (Saran Kol 1) */}
            <path 
                d="M 32 50 C 28 34, 42 28, 60 30" 
                stroke="currentColor" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
            />
            
            {/* Right/Bottom Arm (Kapsülü Kucaklayan Kol) */}
            <path 
                d="M 36 70 C 48 88, 82 82, 74 46" 
                stroke="currentColor" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
            />
        </svg>
    );
}
