import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  FeatureLevel,
  MetricField,
  NumericFilter,
  PropertyType,
} from "@/types";
import { useSyncUrlWithFilters } from "./useFiltersNavigate";

export interface FilterState {
  level: FeatureLevel;
  propertyType: PropertyType;
  field: MetricField;
  year: number;
  inseeCodes: string[];
  sections: string[];
  month?: number;
  filters?: NumericFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  bbox?: [number, number, number, number];
}

export interface FilterContextValue {
  state: FilterState;
  setFilters: (updates: Partial<FilterState>) => void;
  resetFilters: (nextState?: Partial<FilterState>) => void;
  setLevel: (level: FeatureLevel) => void;
  setField: (field: MetricField) => void;
  setPropertyType: (propertyType: PropertyType) => void;
  setYear: (year: number) => void;
  setMonth: (month?: number) => void;
  setBoundingBox: (bbox?: [number, number, number, number]) => void;
  setInseeCodes: (inseeCodes: string[]) => void;
  setSections: (sections: string[]) => void;
}

export const DEFAULT_FILTERS: FilterState = {
  level: "commune",
  propertyType: "apartment",
  field: "avg_price_m2",
  year: 2024,
  inseeCodes: [],
  sections: [],
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  initialState?: Partial<FilterState>;
}

export function MapFilterProvider({
  children,
  initialState,
}: FilterProviderProps) {
  const [state, setState] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialState,
  });

  const setFilters = useCallback((updates: Partial<FilterState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFilters = useCallback((nextState?: Partial<FilterState>) => {
    setState({
      ...DEFAULT_FILTERS,
      ...nextState,
    });
  }, []);

  const setLevel = useCallback(
    (level: FeatureLevel) => {
      setFilters({ level });
    },
    [setFilters]
  );

  const setField = useCallback(
    (field: MetricField) => {
      setFilters({ field });
    },
    [setFilters]
  );

  const setPropertyType = useCallback(
    (propertyType: PropertyType) => {
      setFilters({ propertyType });
    },
    [setFilters]
  );

  const setYear = useCallback(
    (year: number) => {
      setFilters({ year });
    },
    [setFilters]
  );

  const setMonth = useCallback(
    (month?: number) => {
      setFilters({ month });
    },
    [setFilters]
  );

  const setBoundingBox = useCallback(
    (bbox?: [number, number, number, number]) => {
      setFilters({ bbox });
    },
    [setFilters]
  );

  const setInseeCodes = useCallback((inseeCodes: string[]) => {
    setState((prev) => {
      const next = {
        ...prev,
        inseeCodes,
      };

      if (inseeCodes.length > 0 && prev.level !== "section") {
        next.level = "section";
      } else if (inseeCodes.length === 0 && prev.level === "section") {
        next.level = "commune";
      }

      return next;
    });
  }, []);

  const setSections = useCallback((sections: string[]) => {
    setState((prev) => {
      const next = {
        ...prev,
        sections,
      };

      if (sections.length > 0 && prev.level !== "commune") {
        next.level = "commune";
      } else if (sections.length === 0 && prev.level === "commune") {
        next.level = "section";
      }

      return next;
    });
  }, []);

  useSyncUrlWithFilters(setLevel);

  const value = useMemo<FilterContextValue>(
    () => ({
      state,
      setFilters,
      resetFilters,
      setLevel,
      setField,
      setPropertyType,
      setYear,
      setMonth,
      setBoundingBox,
      setInseeCodes,
      setSections,
    }),
    [
      state,
      setFilters,
      resetFilters,
      setLevel,
      setField,
      setPropertyType,
      setYear,
      setMonth,
      setBoundingBox,
      setInseeCodes,
      setSections,
    ]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a MapFilterProvider");
  }

  return context;
}
