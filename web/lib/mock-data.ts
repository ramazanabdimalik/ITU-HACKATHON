import data from "../data/mock.json";
import type { MockData } from "./types";

// Generated from typed models; JSON inference widens tuples and literal unions.
// Fixture integrity and stored scores are checked in mock-data.test.ts.
// API scoring never mutates this demonstration fixture.
export const mockData = data as unknown as MockData;
