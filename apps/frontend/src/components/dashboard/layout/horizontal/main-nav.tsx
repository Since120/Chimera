'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LaunchIcon from '@mui/icons-material/Launch';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';

import type { NavItemConfig } from '@/types/nav';
import type { DashboardNavColor } from '@/types/settings';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useDialog } from '@/hooks/use-dialog';
import { usePopover } from '@/hooks/use-popover';
import { Dropdown } from '@/components/core/dropdown/dropdown';
import { DropdownPopover } from '@/components/core/dropdown/dropdown-popover';
import { DropdownTrigger } from '@/components/core/dropdown/dropdown-trigger';
import { Logo } from '@/components/core/logo';
import { SearchDialog } from '@/components/dashboard/layout/search-dialog';
import type { ColorScheme } from '@/styles/theme/types';
import { useAuth } from '@/context/auth-context';

import { ContactsPopover } from '../contacts-popover';
import { languageFlags, LanguagePopover } from '../language-popover';
import type { Language } from '../language-popover';
import { MobileNav } from '../mobile-nav';
import { icons } from '../nav-icons';
import { NotificationsPopover } from '../notifications-popover';
import { UserPopover } from '../user-popover';
import { WorkspacesSwitch } from '../workspaces-switch';
import { navColorStyles } from './styles';


const logoColors = {
	dark: { blend_in: 'light', discrete: 'light', evident: 'light' },
	light: { blend_in: 'dark', discrete: 'dark', evident: 'light' },
} as Record<ColorScheme, Record<DashboardNavColor, 'dark' | 'light'>>;

export interface MainNavProps {
	color?: DashboardNavColor;
	items?: NavItemConfig[];
}

export function MainNav({ color = 'evident', items = [] }: MainNavProps): React.JSX.Element {
	const pathname = usePathname();

	const [openNav, setOpenNav] = React.useState<boolean>(false);

	const { colorScheme = 'light' } = useColorScheme();

	const styles = navColorStyles[colorScheme][color];
	const logoColor = logoColors[colorScheme][color];

	// Debug-Log für die Nav-Color
	console.log('NavColor in horizontal layout:', color, styles);

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					...styles,
					bgcolor: 'var(--MainNav-background)',
					border: 'var(--MainNav-border)',
					color: 'var(--MainNav-color)',
					left: 0,
					position: 'sticky',
					top: 0,
					zIndex: 'var(--MainNav-zIndex)',
					backdropFilter: 'blur(10px)',
					boxShadow: `0 0 20px rgba(var(--mui-palette-primary-mainChannel), 0.3)`,
					fontFamily: 'monospace',
					letterSpacing: '0.03em',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flex: '1 1 auto',
						minHeight: 'var(--MainNav-height, 72px)',
						px: { xs: 2, sm: 3 },
						py: 1,
					}}
				>
					<Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							sx={{ display: { md: 'none' } }}
						>
							<MenuIcon sx={{ color: 'var(--NavItem-icon-color)' }} />
						</IconButton>
						<Box component={RouterLink} href={paths.home} sx={{ display: { xs: 'none', md: 'inline-block' } }}>
							<Logo color={logoColor} height={32} width={122} />
						</Box>
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<WorkspacesSwitch />
						</Box>

					</Stack>
					<Stack
						direction="row"
						spacing={2}
						sx={{ alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}
					>
						<SearchButton />
						<NotificationsButton />
						<ContactsButton />
						<Divider
							flexItem
							orientation="vertical"
							sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', md: 'block' } }}
						/>
						<LanguageSwitch />
						<UserButton />
					</Stack>
				</Box>
				<Box
					component="nav"
					sx={{
						borderTop: '1px solid var(--MainNav-divider)',
						display: { xs: 'none', md: 'block' },
						minHeight: '56px',
						overflowX: 'auto',
					}}
				>
					{renderNavGroups({ items, pathname })}
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

	return (
		<React.Fragment>
			<Tooltip title="Search">
				<IconButton onClick={dialog.handleOpen} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
					<SearchIcon sx={{ color: 'var(--NavItem-icon-color)' }} />
				</IconButton>
			</Tooltip>
			<SearchDialog onClose={dialog.handleClose} open={dialog.open} />
		</React.Fragment>
	);
}

function NotificationsButton(): React.JSX.Element {
	const popover = usePopover<HTMLButtonElement>();

	return (
		<React.Fragment>
			<Tooltip title="Notifications">
				<Badge
					color="error"
					sx={{ '& .MuiBadge-dot': { borderRadius: '50%', height: '10px', right: '6px', top: '6px', width: '10px' } }}
					variant="dot"
				>
					<IconButton onClick={popover.handleOpen} ref={popover.anchorRef}>
						<NotificationsIcon sx={{ color: 'var(--NavItem-icon-color)' }} />
					</IconButton>
				</Badge>
			</Tooltip>
			<NotificationsPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
		</React.Fragment>
	);
}

function ContactsButton(): React.JSX.Element {
	const popover = usePopover<HTMLButtonElement>();

	return (
		<React.Fragment>
			<Tooltip title="Contacts">
				<IconButton onClick={popover.handleOpen} ref={popover.anchorRef}>
					<PeopleIcon sx={{ color: 'var(--NavItem-icon-color)' }} />
				</IconButton>
			</Tooltip>
			<ContactsPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
		</React.Fragment>
	);
}

function LanguageSwitch(): React.JSX.Element {
	const { i18n } = useTranslation();
	const popover = usePopover<HTMLButtonElement>();
	const language = (i18n.language || 'en') as Language;
	const flag = languageFlags[language];

	return (
		<React.Fragment>
			<Tooltip title="Language">
				<IconButton
					onClick={popover.handleOpen}
					ref={popover.anchorRef}
					sx={{ display: { xs: 'none', md: 'inline-flex' } }}
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
	const avatarUrl = user?.avatar
	  ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`
	  : '/assets/avatar.png';

	return (
	  <React.Fragment>
		<Box
		  component="button"
		  onClick={popover.handleOpen}
		  ref={popover.anchorRef}
		  sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
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
			  },
			}}
			variant="dot"
		  >
			<Avatar src={avatarUrl} />
		  </Badge>
		</Box>
		<UserPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
	  </React.Fragment>
	);
  }

function renderNavGroups({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
	const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
		acc.push(
			<Box component="li" key={curr.key} sx={{ flex: '0 0 auto' }}>
				{renderNavItems({ pathname, items: curr.items })}
			</Box>
		);

		return acc;
	}, []);

	return (
		<Stack component="ul" direction="row" spacing={2} sx={{ listStyle: 'none', m: 0, p: '8px 12px' }}>
			{children}
		</Stack>
	);
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
	const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
		const { key, ...item } = curr;

		acc.push(<NavItem key={key} pathname={pathname} {...item} />);

		return acc;
	}, []);

	return (
		<Stack component="ul" direction="row" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
			{children}
		</Stack>
	);
}

interface NavItemProps extends NavItemConfig {
	pathname: string;
}

function NavItem({
	disabled,
	external,
	items,
	href,
	icon,
	label,
	matcher,
	pathname,
	title,
}: NavItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, matcher, pathname });
	const Icon = icon ? icons[icon] : null;
	const isBranch = Boolean(items);

	const element = (
		<Box component="li" sx={{ userSelect: 'none' }}>
			<Box
				{...(isBranch
					? { role: 'button' }
					: {
							...(href
								? {
										component: external ? 'a' : RouterLink,
										href,
										target: external ? '_blank' : undefined,
										rel: external ? 'noreferrer' : undefined,
									}
								: { role: 'button' }),
						})}
				sx={{
					alignItems: 'center',
					borderRadius: 1,
					color: 'var(--NavItem-color)',
					cursor: 'pointer',
					display: 'flex',
					flex: '0 0 auto',
					gap: 1,
					p: '6px 16px',
					textDecoration: 'none',
					whiteSpace: 'nowrap',
					position: 'relative',
					fontFamily: 'monospace',
					letterSpacing: '0.05em',
					transition: 'all 0.2s',
					'&::before': {
						content: '""',
						position: 'absolute',
						left: 0,
						right: 0,
						height: '100%',
						opacity: 0,
						background: 'linear-gradient(to right, rgba(var(--mui-palette-primary-mainChannel), 0.1), transparent)',
						transition: 'opacity 0.2s',
					},
					...(disabled && {
						bgcolor: 'var(--NavItem-disabled-background)',
						color: 'var(--NavItem-disabled-color)',
						cursor: 'not-allowed',
					}),
					...(active && {
						bgcolor: 'var(--NavItem-active-background)',
						color: 'var(--NavItem-active-color)',
						'&::before': {
							opacity: 1,
						},
					}),
					'&:hover': {
						...(!disabled &&
							!active && {
								bgcolor: 'var(--NavItem-hover-background)',
								color: 'var(--NavItem-hover-color)',
								'&::before': {
									opacity: 0.7,
								},
							}),
					},
				}}
				tabIndex={0}
			>
				{Icon ? (
					<Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
						<Icon
							fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
							fontSize="var(--icon-fontSize-md)"
							weight={active ? 'fill' : undefined}
						/>
					</Box>
				) : null}
				<Box sx={{ flex: '1 1 auto' }}>
					<Typography
						component="span"
						sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
					>
						{title}
					</Typography>
				</Box>
				{label ? <Chip color="primary" label={label} size="small" /> : null}
				{external ? (
					<Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
						<LaunchIcon sx={{ color: 'var(--NavItem-icon-color)', fontSize: 'var(--icon-fontSize-sm)' }} />
					</Box>
				) : null}
				{isBranch ? (
					<Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
						<KeyboardArrowDownIcon sx={{ color: 'var(--NavItem-expand-color)', fontSize: 'var(--icon-fontSize-sm)' }} />
					</Box>
				) : null}
			</Box>
		</Box>
	);

	if (items) {
		return (
			<Dropdown>
				<DropdownTrigger>{element}</DropdownTrigger>
				<DropdownPopover
					PaperProps={{
						sx: {
							minWidth: '200px',
							p: 1,
							bgcolor: 'rgba(10, 20, 30, 0.85)',
							backdropFilter: 'blur(10px)',
							border: '1px solid rgba(90, 220, 220, 0.2)',
							boxShadow: '0 0 20px rgba(var(--mui-palette-primary-mainChannel), 0.3)'
						}
					}}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
				>
					{renderDropdownItems({ pathname, items })}
				</DropdownPopover>
			</Dropdown>
		);
	}

	return element;
}

function renderDropdownItems({
	items = [],
	pathname,
}: {
	items?: NavItemConfig[];
	pathname: string;
}): React.JSX.Element {
	const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
		const { key, ...item } = curr;

		acc.push(<DropdownItem key={key} pathname={pathname} {...item} />);

		return acc;
	}, []);

	return (
		<Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
			{children}
		</Stack>
	);
}

interface DropdownItemProps extends NavItemConfig {
	pathname: string;
}

function DropdownItem({
	disabled,
	external,
	items,
	href,
	matcher,
	pathname,
	title,
}: DropdownItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, matcher, pathname });
	const isBranch = Boolean(items);

	const element = (
		<Box component="li" sx={{ userSelect: 'none' }}>
			<Box
				{...(isBranch
					? { role: 'button' }
					: {
							...(href
								? {
										component: external ? 'a' : RouterLink,
										href,
										target: external ? '_blank' : undefined,
										rel: external ? 'noreferrer' : undefined,
									}
								: { role: 'button' }),
						})}
				sx={{
					alignItems: 'center',
					borderRadius: 1,
					color: 'var(--NavItem-color)',
					cursor: 'pointer',
					display: 'flex',
					flex: '0 0 auto',
					p: '6px 16px',
					textDecoration: 'none',
					whiteSpace: 'nowrap',
					fontFamily: 'monospace',
					letterSpacing: '0.05em',
					position: 'relative',
					transition: 'all 0.2s',
					'&::before': {
						content: '""',
						position: 'absolute',
						left: 0,
						right: 0,
						height: '100%',
						opacity: 0,
						background: 'linear-gradient(to right, rgba(var(--mui-palette-primary-mainChannel), 0.1), transparent)',
						transition: 'opacity 0.2s',
					},
					...(disabled && {
						bgcolor: 'var(--NavItem-disabled-background)',
						color: 'var(--NavItem-disabled-color)',
						cursor: 'not-allowed',
					}),
					...(active && {
						bgcolor: 'var(--NavItem-active-background)',
						color: 'var(--NavItem-active-color)',
						'&::before': {
							opacity: 1,
						},
					}),
					'&:hover': {
						...(!disabled &&
							!active && {
								bgcolor: 'var(--NavItem-hover-background)',
								color: 'var(--NavItem-hover-color)',
								'&::before': {
									opacity: 0.7,
								},
							}),
					},
				}}
				tabIndex={0}
			>
				<Box sx={{ flex: '1 1 auto' }}>
					<Typography
						component="span"
						sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
					>
						{title}
					</Typography>
				</Box>
				{isBranch ? (
					<Box sx={{ flex: '0 0 auto' }}>
						<KeyboardArrowRightIcon sx={{ color: 'var(--NavItem-expand-color)', fontSize: 'var(--icon-fontSize-sm)' }} />
					</Box>
				) : null}
			</Box>
		</Box>
	);

	if (items) {
		return (
			<Dropdown>
				<DropdownTrigger>{element}</DropdownTrigger>
				<DropdownPopover
					PaperProps={{
						sx: {
							minWidth: '200px',
							p: 1,
							bgcolor: 'rgba(10, 20, 30, 0.85)',
							backdropFilter: 'blur(10px)',
							border: '1px solid rgba(90, 220, 220, 0.2)',
							boxShadow: '0 0 20px rgba(var(--mui-palette-primary-mainChannel), 0.3)'
						}
					}}
					anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
				>
					{renderDropdownItems({ pathname, items })}
				</DropdownPopover>
			</Dropdown>
		);
	}

	return element;
}