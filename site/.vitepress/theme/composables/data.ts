import { useData as useData$ } from 'vitepress'
import { type CustomConfig } from '../../theme';

export const useData: typeof useData$<CustomConfig> = useData$
