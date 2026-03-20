// "use client"

// import Image from 'next/image'
// import { useTheme } from './ThemeContext'

// export default function ThemeToggle() {
//   const { theme, toggleTheme } = useTheme()

//   return (
//     <button
//       onClick={toggleTheme}
//       className="fixed top-24 right-4 z-40 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
//       style={{
//         background: theme === 'space' 
//           ? 'rgba(30, 30, 40, 0.8)' 
//           : 'rgba(255, 255, 255, 0.8)',
//         border: theme === 'space'
//           ? '1px solid rgba(100, 100, 150, 0.3)'
//           : '1px solid rgba(100, 150, 255, 0.3)',
//         boxShadow: theme === 'space'
//           ? '0 4px 12px rgba(0, 0, 0, 0.4)'
//           : '0 4px 12px rgba(100, 150, 255, 0.2)',
//       }}
//       aria-label={`Switch to ${theme === 'space' ? 'futuristic' : 'space'} theme`}
//     >
//       <div 
//         className="w-10 h-10 relative"
//         style={{
//           filter: theme === 'space' 
//             ? 'brightness(0) invert(1)' // White for dark background
//             : 'brightness(0) invert(0.2)', // Dark for light background
//         }}
//       >
//         <Image
//           src={theme === 'space' ? '/images/LightThemeSymbol3.png' : '/images/SpaceThemeSymbol3.png'}
//           alt=""
//           fill
//           className="object-contain"
//          // style={{imageRendering: 'pixelated'}}
//         />
//       </div>
//     </button>
//   )
// }
