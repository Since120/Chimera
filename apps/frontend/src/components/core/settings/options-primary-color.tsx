'use client';

import type * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';

import type { PrimaryColor } from '@/styles/theme/types';

import { Option } from './option';

export interface OptionsPrimaryColorProps {
	onChange?: (value: PrimaryColor) => void;
	value?: PrimaryColor;
}

export function OptionsPrimaryColor({ onChange, value }: OptionsPrimaryColorProps): React.JSX.Element {
	return (
		<Stack spacing={1}>
			<InputLabel>Primary color</InputLabel>
			<Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
				{(
					[
						{ label: 'Green', value: 'green' as PrimaryColor, color: '#16b364' }, // Updated value and label
						{ label: 'Blue', value: 'blue' as PrimaryColor, color: '#635bff' }, // Updated value and label (covers neonBlue and royalBlue)
						// Removed Royal Blue as it maps to 'blue'
						{ label: 'Red', value: 'red' as PrimaryColor, color: '#ff6c47' } // Updated value and label
					] satisfies { label: string; value: PrimaryColor; color: string }[]
				).map((option) => (
					<Option
						icon={
							<Box
								sx={{ bgcolor: option.color, borderRadius: '50%', flex: '0 0 auto', height: '24px', width: '24px' }}
							/>
						}
						key={option.value}
						label={option.label}
						onClick={() => {
							onChange?.(option.value);
						}}
						selected={option.value === value}
					/>
				))}
			</Stack>
		</Stack>
	);
}
