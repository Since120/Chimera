'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

import type { NavItemConfig } from '@/types/nav';
import { useDialog } from '@/hooks/use-dialog';
import { usePopover } from '@/hooks/use-popover';
import { useAuth } from '@/context/auth-context';

import { ContactsPopover } from '../contacts-popover';
import { languageFlags, LanguagePopover } from '../language-popover';
import type { Language } from '../language-popover';
import { MobileNav } from '../mobile-nav';
import { NotificationsPopover } from '../notifications-popover';
import { SearchDialog } from '../search-dialog';
import { UserPopover } from '../user-popover';

export interface MainNavProps {
	items: NavItemConfig[];
}

export function MainNav({ items }: MainNavProps): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const theme = useTheme();

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					'--MainNav-background': theme.palette.mode === 'dark' ? 'rgba(15, 25, 35, 0.75)' : 'rgba(245, 250, 255, 0.9)',
					'--MainNav-divider': 'rgba(90, 220, 220, 0.3)',
					bgcolor: 'var(--MainNav-background)',
					left: 0,
					position: 'sticky',
					pt: { lg: 'var(--Layout-gap)' },
					top: 0,
					width: '100%',
					zIndex: 'var(--MainNav-zIndex)',
					backdropFilter: 'blur(10px)',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
				}}
			>
				<Box
					sx={{
						borderBottom: '1px solid var(--MainNav-divider)',
						display: 'flex',
						flex: '1 1 auto',
						minHeight: 'var(--MainNav-height)',
						px: { xs: 2, lg: 3 },
						py: 1,
					}}
				>
					<Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							sx={{ display: { lg: 'none' } }}
						>
							<MenuIcon />
						</IconButton>
						<SearchButton />
					</Stack>
					<Stack
						direction="row"
						spacing={2}
						sx={{ alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}
					>

						<NotificationsButton />
						<ContactsButton />
						<Divider
							flexItem
							orientation="vertical"
							sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', lg: 'block' } }}
						/>
						<LanguageSwitch />
						<UserButton />
					</Stack>
				</Box>
			</Box>
			<MobileNav
				items={items}
				onClose={() => {
					setOpenNav(false);
				}}
				open={openNav}
			/>
		</React.Fragment>
	);
}

function SearchButton(): React.JSX.Element {
	const dialog = useDialog();
	const theme = useTheme();

	return (
		<React.Fragment>
			<Tooltip title="Search">
				<IconButton
					onClick={dialog.handleOpen}
					sx={{
						display: { xs: 'none', lg: 'inline-flex' },
						transition: 'all 0.2s',
						'&:hover': {
							backgroundColor: theme.palette.mode === 'dark'
								? 'rgba(var(--mui-palette-primary-mainChannel), 0.15)'
								: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
							boxShadow: theme.palette.mode === 'dark'
								? '0 0 10px rgba(var(--mui-palette-primary-mainChannel), 0.5)'
								: '0 0 8px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
						},
					}}
				>
					<SearchIcon />
				</IconButton>
			</Tooltip>
			<SearchDialog onClose={dialog.handleClose} open={dialog.open} />
		</React.Fragment>
	);
}

function ContactsButton(): React.JSX.Element {
	const popover = usePopover<HTMLButtonElement>();
	const theme = useTheme();

	return (
		<React.Fragment>
			<Tooltip title="Contacts">
				<IconButton
					onClick={popover.handleOpen}
					ref={popover.anchorRef}
					sx={{
						transition: 'all 0.2s',
						'&:hover': {
							backgroundColor: theme.palette.mode === 'dark'
								? 'rgba(var(--mui-palette-primary-mainChannel), 0.15)'
								: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
							boxShadow: theme.palette.mode === 'dark'
								? '0 0 10px rgba(var(--mui-palette-primary-mainChannel), 0.5)'
								: '0 0 8px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
						},
					}}
				>
					<PeopleIcon />
				</IconButton>
			</Tooltip>
			<ContactsPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
		</React.Fragment>
	);
}

function NotificationsButton(): React.JSX.Element {
	const popover = usePopover<HTMLButtonElement>();
	const theme = useTheme();

	return (
		<React.Fragment>
			<Tooltip title="Notifications">
				<Badge
					color="error"
					sx={{
						'& .MuiBadge-dot': {
							borderRadius: '50%',
							height: '10px',
							right: '6px',
							top: '6px',
							width: '10px',
							boxShadow: '0 0 5px var(--mui-palette-error-main)'
						}
					}}
					variant="dot"
				>
					<IconButton
						onClick={popover.handleOpen}
						ref={popover.anchorRef}
						sx={{
							transition: 'all 0.2s',
							'&:hover': {
								backgroundColor: theme.palette.mode === 'dark'
									? 'rgba(var(--mui-palette-primary-mainChannel), 0.15)'
									: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
								boxShadow: theme.palette.mode === 'dark'
									? '0 0 10px rgba(var(--mui-palette-primary-mainChannel), 0.5)'
									: '0 0 8px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
							},
						}}
					>
						<NotificationsIcon />
					</IconButton>
				</Badge>
			</Tooltip>
			<NotificationsPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
		</React.Fragment>
	);
}

function LanguageSwitch(): React.JSX.Element {
	const { i18n } = useTranslation();
	const popover = usePopover<HTMLButtonElement>();
	const language = (i18n.language || 'en') as Language;
	const flag = languageFlags[language];
	const theme = useTheme();

	return (
		<React.Fragment>
			<Tooltip title="Language">
				<IconButton
					onClick={popover.handleOpen}
					ref={popover.anchorRef}
					sx={{
						display: { xs: 'none', lg: 'inline-flex' },
						transition: 'all 0.2s',
						'&:hover': {
							backgroundColor: theme.palette.mode === 'dark'
								? 'rgba(var(--mui-palette-primary-mainChannel), 0.15)'
								: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
							boxShadow: theme.palette.mode === 'dark'
								? '0 0 10px rgba(var(--mui-palette-primary-mainChannel), 0.5)'
								: '0 0 8px rgba(var(--mui-palette-primary-mainChannel), 0.3)',
						},
					}}
				>
					<Box sx={{ height: '24px', width: '24px' }}>
						<Box alt={language} component="img" src={flag} sx={{ height: 'auto', width: '100%' }} />
					</Box>
				</IconButton>
			</Tooltip>
			<LanguagePopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
		</React.Fragment>
	);
}

const user = {
	id: 'USR-000',
	name: 'Sofia Rivers',
	avatar: '/assets/avatar.png',
	email: 'sofia@devias.io',
} as const;

function UserButton(): React.JSX.Element {
	const popover = usePopover<HTMLButtonElement>();
	const { user } = useAuth();

	// Get Discord avatar URL or fallback to default
	const avatarUrl = user?.avatar_url || '/assets/avatar.png';

	return (
	  <React.Fragment>
		<Box
		  component="button"
		  onClick={popover.handleOpen}
		  ref={popover.anchorRef}
		  sx={{
			border: 'none',
			background: 'transparent',
			cursor: 'pointer',
			p: 0,
			transition: 'all 0.2s',
			borderRadius: '50%',
			'&:hover': {
				boxShadow: '0 0 15px rgba(var(--mui-palette-primary-mainChannel), 0.7)',
			},
		  }}
		>
		  <Badge
			anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			color="success"
			sx={{
			  '& .MuiBadge-dot': {
				border: '2px solid var(--MainNav-background)',
				borderRadius: '50%',
				bottom: '6px',
				height: '12px',
				right: '6px',
				width: '12px',
				boxShadow: '0 0 5px var(--mui-palette-success-main)'
			  },
			}}
			variant="dot"
		  >
			<Avatar
				src={avatarUrl}
				sx={{
					border: '1px solid rgba(var(--mui-palette-primary-mainChannel), 0.3)',
				}}
			/>
		  </Badge>
		</Box>
		<UserPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
	  </React.Fragment>
	);
  }