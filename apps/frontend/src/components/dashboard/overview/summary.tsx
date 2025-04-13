import type * as React from 'react';
import type { ElementType } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

export interface SummaryProps {
	amount: number;
	diff: number;
	icon: ElementType;
	title: string;
	trend: 'up' | 'down';
}

export function Summary({ amount, diff, icon: Icon, title, trend }: SummaryProps): React.JSX.Element {
	return (
		<Card>
			<CardContent>
				<Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
					<Avatar
						sx={{
							'--Avatar-size': '48px',
							bgcolor: 'var(--mui-palette-background-paper)',
							boxShadow: 'var(--mui-shadows-8)',
							color: 'var(--mui-palette-text-primary)',
						}}
					>
						<Icon sx={{ fontSize: 'var(--icon-fontSize-lg)' }} />
					</Avatar>
					<div>
						<Typography color="text.secondary" variant="body1">
							{title}
						</Typography>
						<Typography variant="h3">{new Intl.NumberFormat('en-US').format(amount)}</Typography>
					</div>
				</Stack>
			</CardContent>
			<Divider />
			<Box sx={{ p: '16px' }}>
				<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
					<Box
						sx={{
							alignItems: 'center',
							color: trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						{trend === 'up' ? (
							<ArrowUpwardIcon sx={{ fontSize: 'var(--icon-fontSize-md)' }} />
						) : (
							<ArrowDownwardIcon sx={{ fontSize: 'var(--icon-fontSize-md)' }} />
						)}
					</Box>
					<Typography color="text.secondary" variant="body2">
						<Typography color={trend === 'up' ? 'success.main' : 'error.main'} component="span" variant="subtitle2">
							{new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(diff / 100)}
						</Typography>{' '}
						{trend === 'up' ? 'increase' : 'decrease'} vs last month
					</Typography>
				</Stack>
			</Box>
		</Card>
	);
}
