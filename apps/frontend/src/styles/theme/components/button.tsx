import { buttonClasses } from '@mui/material/Button';
import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

function getContainedVars(color: string): Record<string, string> {
	return {
		'--Button-containedBg': `var(--mui-palette-${color}-dark)`,
		'--Button-containedBgGradient': `linear-gradient(180deg, var(--mui-palette-${color}-main) 0%, var(--mui-palette-${color}-dark) 100%)`,
		'--Button-containedStroke': `inset 0px 0px 0px 1px var(--mui-palette-${color}-dark), inset 0px 2px 0px 0px rgba(255, 255, 255, 0.16)`,
	};
}

function getOutlinedVars(color: string, dark: boolean): Record<string, string> {
	const vars = {
		'--Button-outlinedBorder': `var(--mui-palette-${color}-main)`,
		'--Button-outlinedHoverBg': `var(--mui-palette-${color}-hovered)`,
		'--Button-outlinedActiveBg': `var(--mui-palette-${color}-activated)`,
	};

	// Custom case for secondary
	if (color === 'secondary') {
		vars['--Button-outlinedBorder'] = dark ? 'var(--mui-palette-secondary-700)' : 'var(--mui-palette-secondary-200)';
	}

	return vars;
}

function getTextVars(color: string): Record<string, string> {
	return {
		'--Button-textHoverBg': `var(--mui-palette-${color}-hovered)`,
		'--Button-textActiveBg': `var(--mui-palette-${color}-activated)`,
	};
}

export const MuiButton = {
	defaultProps: { disableRipple: true },
	styleOverrides: {
		root: ({ theme }) => {
			const primaryColor = theme.palette.primary.main;
			return {
				borderRadius: '6px',
				minHeight: 'var(--Button-minHeight)',
				minWidth: 'unset',
				textTransform: 'none',
				fontFamily: 'monospace',
				letterSpacing: '0.05em',
				position: 'relative',
				overflow: 'hidden',
				transition: 'all 0.2s ease',
				'&:focus-visible': { outline: `2px solid ${primaryColor}` },
				// Laserlinie Animation für alle Buttons
				'&::before': {
					content: '""',
					position: 'absolute',
					top: '50%',
					left: '-100%',
					width: '50%',
					height: '1px',
					background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
					animation: 'scan-button 3s infinite',
					boxShadow: `0 0 8px ${primaryColor}`,
					opacity: 0,
					transition: 'opacity 0.2s',
				},
				'&:hover::before': {
					opacity: 0.8,
				},
				'@keyframes scan-button': {
					'0%': { left: '-100%' },
					'100%': { left: '200%' }
				}
			};
		},
		text: {
			'&:hover': { backgroundColor: 'var(--Button-textHoverBg)' },
			'&:active': { backgroundColor: 'var(--Button-textActiveBg)' },
		},
		textPrimary: getTextVars('primary'),
		textSecondary: getTextVars('secondary'),
		textSuccess: getTextVars('success'),
		textInfo: getTextVars('info'),
		textWarning: getTextVars('warning'),
		textError: getTextVars('error'),
		outlined: ({ theme }) => {
			const primaryColor = theme.palette.primary.main;
			return {
				backgroundColor: 'transparent',
				boxShadow: theme.palette.mode === 'dark' 
					? `0 0 10px ${primaryColor}22` 
					: 'none',
				borderColor: theme.palette.mode === 'dark' 
					? `${primaryColor}` 
					: 'var(--Button-outlinedBorder)',
				'&:hover': { 
					borderColor: 'var(--Button-outlinedBorder)', 
					backgroundColor: 'var(--Button-outlinedHoverBg)',
					boxShadow: `0 0 15px ${primaryColor}66`
				},
				'&:active': { backgroundColor: 'var(--Button-outlinedActiveBg)' },
			};
		},
		outlinedPrimary: ({ theme }) => {
			return getOutlinedVars('primary', theme.palette.mode === 'dark');
		},
		outlinedSecondary: ({ theme }) => {
			return getOutlinedVars('secondary', theme.palette.mode === 'dark');
		},
		outlinedSuccess: ({ theme }) => {
			return getOutlinedVars('success', theme.palette.mode === 'dark');
		},
		outlinedInfo: ({ theme }) => {
			return getOutlinedVars('info', theme.palette.mode === 'dark');
		},
		outlinedWarning: ({ theme }) => {
			return getOutlinedVars('warning', theme.palette.mode === 'dark');
		},
		outlinedError: ({ theme }) => {
			return getOutlinedVars('error', theme.palette.mode === 'dark');
		},
		contained: ({ theme }) => {
			const primaryColor = theme.palette.primary.main;
			return {
				// Hellerer Hintergrund im Dark Mode, dunklerer im Light Mode für besseren Kontrast
				backgroundColor: theme.palette.mode === 'dark' 
					? 'rgba(30, 50, 80, 0.8)' 
					: 'rgba(50, 90, 170, 0.9)',
				backdropFilter: 'blur(5px)',
				border: `1px solid ${primaryColor}`,
				boxShadow: theme.palette.mode === 'dark'
					? `0 0 10px ${primaryColor}44` 
					: `0 0 5px ${primaryColor}22`,
				overflow: 'hidden',
				color: theme.palette.mode === 'dark' 
					? '#ffffff' 
					: '#ffffff',
				'&:hover': {
					backgroundColor: theme.palette.mode === 'dark' 
						? 'rgba(40, 70, 120, 0.9)' 
						: 'rgba(70, 110, 200, 0.95)',
					boxShadow: theme.palette.mode === 'dark'
						? `0 0 15px ${primaryColor}88`
						: `0 0 10px ${primaryColor}44`,
					transform: 'translateY(-1px)'
				},
				'&:active': { 
					transform: 'translateY(1px)',
					boxShadow: 'none' 
				},
				'&:focus-visible': { 
					boxShadow: `0 0 15px ${primaryColor}`, 
					outlineOffset: '1px' 
				},
				[`&.${buttonClasses.disabled}`]: { 
					backgroundImage: 'none', 
					opacity: 0.5, 
					'&::before': { opacity: 0 } 
				},
			};
		},
		containedPrimary: getContainedVars('primary'),
		containedSecondary: getContainedVars('secondary'),
		containedSuccess: getContainedVars('success'),
		containedInfo: getContainedVars('info'),
		containedWarning: getContainedVars('warning'),
		containedError: getContainedVars('error'),
		sizeSmall: { '--Button-minHeight': '32x', fontSize: '0.8125rem', lineHeight: '24px' },
		sizeMedium: { '--Button-minHeight': '40x', fontSize: '0.875rem', lineHeight: '28px' },
		sizeLarge: { '--Button-minHeight': '48x', fontSize: '0.9375rem', lineHeight: '32px' },
	},
} satisfies Components<Theme>['MuiButton'];
