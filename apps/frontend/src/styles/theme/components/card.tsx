import { paperClasses } from '@mui/material/Paper';
import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiCard = {
	styleOverrides: {
		root: ({ theme }) => {
			const primaryColor = theme.palette.primary.main;
			return {
				borderRadius: '16px',
				position: 'relative',
				overflow: 'hidden',
				// Dezente Borderlinie nur für Dark Mode
				...(theme.palette.mode === 'dark' && {
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '1px',
						background: `linear-gradient(90deg, transparent, ${primaryColor}33, transparent)`,
						opacity: 0.7,
					}
				}),
				[`&.${paperClasses.elevation1}`]: {
					backgroundColor: theme.palette.mode === 'dark' 
						? 'rgba(15, 25, 35, 0.7)' // Etwas heller für dunklen Modus
						: 'rgba(245, 250, 255, 0.85)', // Mehr Undurchsichtigkeit für hellen Modus
					backdropFilter: 'blur(10px)',
					boxShadow: theme.palette.mode === 'dark'
						? `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px ${primaryColor}33`
						: `0 8px 22px rgba(0, 0, 0, 0.08)`,
					border: theme.palette.mode === 'dark'
						? `1px solid rgba(90, 220, 220, 0.2)`
						: `1px solid rgba(90, 220, 220, 0.15)`,
					transition: 'all 0.3s ease',
					'&:hover': {
						boxShadow: theme.palette.mode === 'dark'
							? `0 10px 35px rgba(0, 0, 0, 0.6), 0 0 12px ${primaryColor}44`
							: `0 10px 25px rgba(0, 0, 0, 0.1)`,
					}
				},
			};
		},
	},
} satisfies Components<Theme>['MuiCard'];
