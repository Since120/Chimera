"use client";

import type * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase"; // No longer needed directly here
// import { useRouter } from "next/navigation"; // No longer needed directly here
import { useAuth } from "@/context/auth-context"; // Import useAuth

export interface SplitLayoutProps {
	children?: React.ReactNode;
}

export function SplitLayout({ children }: SplitLayoutProps): React.JSX.Element {
	const theme = useTheme();
	const [primaryColor, setPrimaryColor] = useState(theme.palette.primary?.main || '#00F5C4');
	const [secondaryColor, setSecondaryColor] = useState(theme.palette.secondary?.main || '#3D63FF');
	const [counter, setCounter] = useState(0);

	// Use theme colors for styling
	useEffect(() => {
		if (theme.palette.primary?.main) {
			setPrimaryColor(theme.palette.primary.main);
		}
		if (theme.palette.secondary?.main) {
			setSecondaryColor(theme.palette.secondary.main);
		}
	}, [theme]);

	// Animation frame counter for scanner effect - langsamer gemacht
	useEffect(() => {
		const interval = setInterval(() => {
			setCounter(prev => (prev + 0.5) % 100);
		}, 20); // Höherer Wert = langsamere Animation (vorher war es 30ms)
		return () => clearInterval(interval);
	}, []);

	// Get the login function from the AuthContext
	const { login } = useAuth();

	// Remove the incorrect handleDiscordLogin function
	// const handleDiscordLogin = async () => { ... };

	return (
		<Box sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			minHeight: "100vh",
			width: "100%",
			position: "relative",
			overflow: "hidden",
		}}>
			{/* Vollbild-Video im Hintergrund */}
			<Box sx={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 0,
			}}>
				<video
					autoPlay
					loop
					muted
					playsInline
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover"
					}}
				>
					<source src="/assets/videoplayback (1).webm" type="video/webm" />
				</video>

				{/* Dunkler Filter über dem Video mit futuristischen Grid-Linien */}
				<Box sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.65)",
					backgroundImage: `
						linear-gradient(to right, rgba(25, 118, 210, 0.05) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(25, 118, 210, 0.05) 1px, transparent 1px)
					`,
					backgroundSize: '30px 30px',
					zIndex: 1,
				}} />
			</Box>

			{/* Hologramm-Projektion Effekt - vertikale Scanlinien */}
			<Box sx={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				backgroundImage: `linear-gradient(90deg, transparent 50%, rgba(60, 240, 230, 0.05) 50%)`,
				backgroundSize: '4px 100%',
				pointerEvents: 'none',
				zIndex: 10,
				opacity: 0.7,
			}} />

			{/* Horizontaler Scanner-Effekt - jetzt mit niedrigerer z-index, damit er hinter dem Login fährt */}
			<Box sx={{
				position: "fixed",
				top: `${counter}%`,
				left: 0,
				width: "100%",
				height: "2px",
				background: `linear-gradient(to right, transparent, ${primaryColor}aa, transparent)`,
				boxShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}`,
				zIndex: 1,
				pointerEvents: 'none',
			}} />

			{/* Futuristischer Login-Container - mit erhöhter z-index */}
			<Box sx={{
				position: "relative",
				width: "320px", // Reduzierte Breite
				maxWidth: "90%",
				zIndex: 5,
				'&::before': {
					content: '""',
					position: 'absolute',
					top: '-10px',
					left: '-10px',
					right: '-10px',
					bottom: '-10px',
					background: `linear-gradient(135deg, transparent 0%, ${primaryColor}22 50%, transparent 100%)`,
					borderRadius: '18px',
					filter: 'blur(8px)',
					opacity: 0.7,
					animation: 'pulse 3s infinite alternate'
				},
				'@keyframes pulse': {
					'0%': { opacity: 0.4, filter: 'blur(8px)' },
					'100%': { opacity: 0.8, filter: 'blur(12px)' }
				}
			}}>
				{/* Hologramm Rahmen */}
				<Box
					className="hexagon"
					sx={{
						position: 'absolute',
						top: '-20px',
						left: '-20px',
						right: '-20px',
						bottom: '-20px',
						border: `1px solid ${primaryColor}44`,
						borderRadius: '18px',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: '4px',
							left: '4px',
							right: '4px',
							bottom: '4px',
							border: `1px solid ${primaryColor}44`,
							borderRadius: '16px',
						},
						'&::after': {
							content: '""',
							position: 'absolute',
							top: '8px',
							left: '8px',
							right: '8px',
							bottom: '8px',
							border: `1px solid ${primaryColor}44`,
							borderRadius: '14px',
						},
					}}
				/>

				{/* Glass Card mit Hologramm-Effekt */}
				<Box sx={{
					position: "relative",
					borderRadius: '16px',
					backgroundColor: 'rgba(10, 20, 30, 0.7)',
					backdropFilter: 'blur(10px)',
					boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px ${primaryColor}44, inset 0 0 6px ${primaryColor}33`,
					border: `1px solid rgba(90, 220, 220, 0.3)`,
					padding: '30px 25px', // Reduziertes Padding
					textAlign: 'center',
					overflow: 'hidden',
				}}>
					{/* Futuristische Laser-Umrandung 1 */}
					<Box sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: '16px',
						padding: '2px',
						'&::before': {
							content: '""',
							position: 'absolute',
							inset: 0,
							borderRadius: '16px',
							padding: '2px',
							background: `linear-gradient(90deg, ${primaryColor}00, ${primaryColor}aa, ${primaryColor}00)`,
							WebkitMask:
								'linear-gradient(#fff 0 0) content-box, ' +
								'linear-gradient(#fff 0 0)',
							WebkitMaskComposite: 'xor',
							maskComposite: 'exclude',
							backgroundSize: '200% 100%',
							animation: 'borderAnimation 3s linear infinite',
						},
						'@keyframes borderAnimation': {
							'0%': { backgroundPosition: '0% 0%' },
							'100%': { backgroundPosition: '200% 0%' }
						}
					}} />

					{/* Laser-Umrandung 2 mit entgegengesetzter Animation */}
					<Box sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: '16px',
						padding: '4px',
						'&::before': {
							content: '""',
							position: 'absolute',
							inset: 0,
							borderRadius: '14px',
							padding: '2px',
							background: `linear-gradient(270deg, ${secondaryColor}00, ${secondaryColor}aa, ${primaryColor}00)`,
							WebkitMask:
								'linear-gradient(#fff 0 0) content-box, ' +
								'linear-gradient(#fff 0 0)',
							WebkitMaskComposite: 'xor',
							maskComposite: 'exclude',
							backgroundSize: '200% 100%',
							animation: 'borderAnimation2 4s linear infinite',
						},
						'@keyframes borderAnimation2': {
							'0%': { backgroundPosition: '200% 0%' },
							'100%': { backgroundPosition: '0% 0%' }
						}
					}} />

					{/* Techno-Linien Hintergrund */}
					<Box sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						opacity: 0.07,
						backgroundImage: `
							linear-gradient(to right, ${primaryColor} 1px, transparent 1px),
							linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px)
						`,
						backgroundSize: '20px 20px',
					}} />

					{/* Logo und Inhalt */}
					<Box sx={{
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 2
					}}>
						{/* Hexagon Logo Container */}
						<Box sx={{
							mb: 2, // Reduzierter Abstand
							position: 'relative',
							width: '70px', // Reduzierte Größe
							height: '70px', // Reduzierte Größe
						}}>
							{/* Rotierende hexagon äußerer Ring */}
							<Box sx={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								animation: 'rotateRing 10s linear infinite',
								'@keyframes rotateRing': {
									'0%': { transform: 'rotate(0deg)' },
									'100%': { transform: 'rotate(360deg)' }
								}
							}}>
								<svg width="70" height="70" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M45 0 L85 25 L85 65 L45 90 L5 65 L5 25 Z"
										stroke={primaryColor}
										strokeWidth="1"
										fill="none"
										strokeDasharray="5 3"
									/>
								</svg>
							</Box>

							{/* Innerer Kreis mit Logo */}
							<Box sx={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: '50px', // Reduzierte Größe
								height: '50px', // Reduzierte Größe
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '50%',
								background: 'rgba(10, 30, 50, 0.6)',
								backdropFilter: 'blur(5px)',
								border: `1px solid rgba(90, 220, 220, 0.3)`,
								boxShadow: `0 0 10px ${primaryColor}44`,
							}}>
								{/* Futuristisches Icon statt Kamera */}
								<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12 2L2 7L12 12L22 7L12 2Z"
										stroke={primaryColor}
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2 17L12 22L22 17"
										stroke={primaryColor}
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M2 12L12 17L22 12"
										stroke={primaryColor}
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</Box>
						</Box>

						{/* Titel im Sci-Fi-Stil */}
						<Typography
							variant="h4"
							component="h1"
							sx={{
								fontWeight: '900',
								letterSpacing: '0.2em',
								mb: 0.5,
								color: primaryColor,
								textShadow: `0 0 10px ${primaryColor}88`,
								fontFamily: 'monospace',
							}}
						>
							PYRO
						</Typography>

						{/* Futuristische Trennlinie */}
						<Box sx={{
							width: '60%',
							height: '2px',
							mb: 2,
							background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
							boxShadow: `0 0 5px ${primaryColor}`,
						}} />

						{/* Untertitel */}
						<Typography
							variant="body2"
							sx={{
								color: 'rgba(200, 240, 240, 0.9)',
								mb: 2, // Reduzierter Abstand
								fontFamily: 'monospace',
								letterSpacing: '0.05em',
								textTransform: 'uppercase',
								fontSize: '0.7rem',
							}}
						>
							Schnell und sicher mit Discord einloggen
						</Typography>

						{/* Discord Login Button mit Sci-Fi-Stil - responsive angepasst */}
						<Button
							onClick={login} // Use the login function from AuthContext
							size="large"
							sx={{
								backgroundColor: 'rgba(10, 20, 40, 0.7)',
								border: `1px solid ${primaryColor}`,
								color: primaryColor,
								'&:hover': {
									backgroundColor: 'rgba(20, 40, 80, 0.8)',
									boxShadow: `0 0 15px ${primaryColor}88`
								},
								py: 1.5,
								px: { xs: 2, sm: 4 },
								fontSize: { xs: '0.8rem', sm: '0.9rem' },
								borderRadius: '6px',
								textTransform: 'uppercase',
								fontFamily: 'monospace',
								letterSpacing: { xs: '0.05em', sm: '0.1em' },
								fontWeight: 'bold',
								width: '100%',
								position: 'relative',
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: { xs: '6px', sm: '10px' },
								whiteSpace: 'nowrap', // Verhindert Zeilenumbrüche im Text
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
								},
								'@keyframes scan-button': {
									'0%': { left: '-100%' },
									'100%': { left: '200%' }
								}
							}}
						>
							{/* Discord Icon */}
							<svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill={primaryColor}/>
							</svg>

							Mit Discord anmelden
						</Button>

						{/* Kleine Tech-Dekoration unten */}
						<Box sx={{
							mt: 3,
							display: 'flex',
							gap: '6px',
							justifyContent: 'center'
						}}>
							{[1, 2, 3, 4, 5].map((dot) => (
								<Box
									key={dot}
									sx={{
										width: '6px',
										height: '6px',
										borderRadius: dot % 2 === 0 ? '50%' : '1px',
										backgroundColor: primaryColor,
										opacity: dot === 3 ? 0.9 : 0.5,
									}}
								/>
							))}
						</Box>

						{/* Slot für children */}
						{children}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default SplitLayout;