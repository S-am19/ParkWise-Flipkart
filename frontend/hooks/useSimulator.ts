"use client";

import { useQuery } from "@tanstack/react-query";
import { parkWiseApi } from "@/lib/api";

export function useSimulator(wardens: number) {
  return useQuery({
    queryKey: ["simulator", wardens],
    queryFn: () => parkWiseApi.simulator(wardens),
    placeholderData: (previous) => previous,
  });
}
