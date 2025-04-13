import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiPaper = {
	styleOverrides: { 
		root: ({ theme }) => {
			const primaryColor = theme.palette.primary.main;
			
			return {
				backgroundImage: 'none',
				position: 'relative',
				overflow: 'hidden',
				borderRadius: '12px',
				...(theme.palette.mode === 'dark' ? {
					backgroundColor: 'rgba(15, 25, 35, 0.75)', // Etwas heller im Dark Mode für besseren Kontrast
					backdropFilter: 'blur(10px)',
					boxShadow: `0 8px 25px rgba(0, 0, 0, 0.35)`,
					border: `1px solid rgba(90, 220, 220, 0.15)`,
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '1px',
						background: `linear-gradient(90deg, transparent, ${primaryColor}33, transparent)`,
						opacity: 0.7,
					},
				} : {
					backgroundColor: 'rgba(245, 250, 255, 0.9)', // Mehr Undurchsichtigkeit im Light Mode
					backdropFilter: 'blur(10px)',
					boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`,
					border: `1px solid rgba(90, 220, 220, 0.12)`,
				}),
				transition: 'all 0.2s ease',
			};
		}
	},
} satisfies Components<Theme>['MuiPaper'];