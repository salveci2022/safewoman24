export const SafeHavenLogo = ({ className = "w-16 h-16" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Escudo de proteção */}
      <path
        d="M50 10 L80 25 L80 50 Q80 75 50 90 Q20 75 20 50 L20 25 Z"
        fill="url(#gradient1)"
        stroke="#ec4899"
        strokeWidth="2"
      />
      
      {/* Coração interno */}
      <path
        d="M50 38 C50 38 42 32 38 36 C34 40 38 48 50 58 C62 48 66 40 62 36 C58 32 50 38 50 38 Z"
        fill="#fdf2f8"
        opacity="0.9"
      />
      
      {/* Mão protegendo */}
      <path
        d="M35 42 L35 55 L40 58 L45 58 L50 54 L50 45 Z"
        fill="#fce7f3"
        opacity="0.7"
      />
      
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="50%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fef3f4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const SafeHavenLogoCompact = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 flex items-center justify-center border-2 border-pink-200 shadow-lg`}>
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Escudo simplificado */}
        <path
          d="M12 2 L20 6 L20 12 C20 16 16 20 12 22 C8 20 4 16 4 12 L4 6 Z"
          fill="#ec4899"
          opacity="0.8"
        />
        {/* Coração pequeno */}
        <path
          d="M12 9.5 C12 9.5 10 8 8.5 9.5 C7 11 8.5 14 12 16.5 C15.5 14 17 11 15.5 9.5 C14 8 12 9.5 12 9.5 Z"
          fill="white"
        />
      </svg>
    </div>
  );
};
