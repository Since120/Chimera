'use client';

import type * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import BriefcaseIcon from '@mui/icons-material/Work';
import FileCodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import ListChecksIcon from '@mui/icons-material/CheckBox';
import PlusIcon from '@mui/icons-material/Add';
import UsersIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';

import { appConfig } from '@/config/app';
import { dayjs } from '@/lib/dayjs';
import { AppChat } from '@/components/dashboard/overview/app-chat';
import { AppLimits } from '@/components/dashboard/overview/app-limits';
import { AppUsage } from '@/components/dashboard/overview/app-usage';
import { Events } from '@/components/dashboard/overview/events';
import { HelperWidget } from '@/components/dashboard/overview/helper-widget';
import { Subscriptions } from '@/components/dashboard/overview/subscriptions';
import { Summary } from '@/components/dashboard/overview/summary';

export default function Page(): React.JSX.Element {
	return (
		<Box
			sx={{
				maxWidth: 'var(--Content-maxWidth)',
				m: 'var(--Content-margin)',
				p: 'var(--Content-padding)',
				width: 'var(--Content-width)',
			}}
		>
			<Stack spacing={4}>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
					<Box sx={{ flex: '1 1 auto' }}>
						<Typography variant="h4">Overview</Typography>
					</Box>
					<div>
						<Button startIcon={<PlusIcon />} variant="contained">
							Dashboard
						</Button>
					</div>
				</Stack>
				<Grid container spacing={4}>
					<Grid item xs={12} md={4}>
						<Summary amount={31} diff={15} icon={ListChecksIcon} title="Tickets" trend="up" />
					</Grid>
					<Grid item xs={12} md={4}>
						<Summary amount={240} diff={5} icon={UsersIcon} title="Sign ups" trend="down" />
					</Grid>
					<Grid item xs={12} md={4}>
						<Summary amount={21} diff={12} icon={WarningIcon} title="Open issues" trend="up" />
					</Grid>
					<Grid item xs={12} md={8}>
						<AppUsage
							data={[
								{ name: 'Jan', v1: 36, v2: 19 },
								{ name: 'Feb', v1: 45, v2: 23 },
								{ name: 'Mar', v1: 26, v2: 12 },
								{ name: 'Apr', v1: 39, v2: 20 },
								{ name: 'May', v1: 26, v2: 12 },
								{ name: 'Jun', v1: 42, v2: 31 },
								{ name: 'Jul', v1: 38, v2: 19 },
								{ name: 'Aug', v1: 39, v2: 20 },
								{ name: 'Sep', v1: 37, v2: 18 },
								{ name: 'Oct', v1: 41, v2: 22 },
								{ name: 'Nov', v1: 45, v2: 24 },
								{ name: 'Dec', v1: 23, v2: 17 },
							]}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<Subscriptions
							subscriptions={[
								{
									id: 'supabase',
									title: 'Supabase',
									icon: '/assets/company-avatar-5.png',
									costs: '$599',
									billingCycle: 'year',
									status: 'paid',
								},
								{
									id: 'vercel',
									title: 'Vercel',
									icon: '/assets/company-avatar-4.png',
									costs: '$20',
									billingCycle: 'month',
									status: 'expiring',
								},
								{
									id: 'auth0',
									title: 'Auth0',
									icon: '/assets/company-avatar-3.png',
									costs: '$20-80',
									billingCycle: 'month',
									status: 'canceled',
								},
								{
									id: 'google_cloud',
									title: 'Google Cloud',
									icon: '/assets/company-avatar-2.png',
									costs: '$100-200',
									billingCycle: 'month',
									status: 'paid',
								},
								{
									id: 'stripe',
									title: 'Stripe',
									icon: '/assets/company-avatar-1.png',
									costs: '$70',
									billingCycle: 'month',
									status: 'paid',
								},
							]}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<AppChat
							messages={[
								{
									id: 'MSG-001',
									content: 'Hello, we spoke earlier on the phone',
									author: { name: 'Alcides Antonio', avatar: '/assets/avatar-10.png', status: 'online' },
									createdAt: new Date(Date.now() - 2 * 60 * 1000),
								},
								{
									id: 'MSG-002',
									content: 'Is the job still available?',
									author: { name: 'Marcus Finn', avatar: '/assets/avatar-9.png', status: 'offline' },
									createdAt: new Date(Date.now() - 56 * 60 * 1000),
								},
								{
									id: 'MSG-003',
									content: "What is a screening task? I'd like to",
									author: { name: 'Carson Darrin', avatar: '/assets/avatar-3.png', status: 'online' },
									createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000 - 23 * 60 * 1000),
								},
								{
									id: 'MSG-004',
									content: 'Still waiting for feedback',
									author: { name: 'Fran Perez', avatar: '/assets/avatar-5.png', status: 'online' },
									createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000 - 6 * 60 * 1000),
								},
								{
									id: 'MSG-005',
									content: 'Need more information about campaigns',
									author: { name: 'Jie Yan', avatar: '/assets/avatar-8.png', status: 'offline' },
									createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000 - 18 * 60 * 1000),
								},
							]}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<Events
							events={[
								{
									id: 'EV-004',
									title: 'Meeting with partners',
									description: '17:00 to 18:00',
									createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
								},
								{
									id: 'EV-003',
									title: 'Interview with Jonas',
									description: '15:30 to 16:45',
									createdAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
								},
								{
									id: 'EV-002',
									title: "Doctor's appointment",
									description: '12:30 to 15:30',
									createdAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
								},
								{
									id: 'EV-001',
									title: 'Weekly meeting',
									description: '09:00 to 09:30',
									createdAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
								},
							]}
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<AppLimits usage={80} />
					</Grid>
					<Grid item xs={12} md={4}>
						<HelperWidget
							action={
								<Button color="secondary" endIcon={<ArrowRightIcon />} size="small">
									Search jobs
								</Button>
							}
							description="Search for jobs that match your skills and apply to them directly."
							icon={BriefcaseIcon}
							label="Jobs"
							title="Find your dream job"
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<HelperWidget
							action={
								<Button color="secondary" endIcon={<ArrowRightIcon />} size="small">
									Help center
								</Button>
							}
							description="Find answers to your questions and get in touch with our team."
							icon={InfoIcon}
							label="Help center"
							title="Need help figuring things out?"
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<HelperWidget
							action={
								<Button color="secondary" endIcon={<ArrowRightIcon />} size="small">
									Documentation
								</Button>
							}
							description="Learn how to get started with our product and make the most of it."
							icon={FileCodeIcon}
							label="Documentation"
							title="Explore documentation"
						/>
					</Grid>
				</Grid>
			</Stack>
		</Box>
	);
}
