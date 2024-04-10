import { useData as useData$ } from "vitepress";
import { type CustomConfig } from "../types";

export const useData: typeof useData$<CustomConfig> = useData$;
