export interface LoadChartData {
  craneId: string;
  craneName: string;
  maxBoomText: string;
  outriggerBaseText: string;
  boomLengths: number[];
  radii: number[];
  // matrix[radiusIndex][boomLengthIndex] -> capacity in tonnes (or null if not permissible)
  matrix: (number | null)[][];
}

export const LOAD_CHARTS: Record<string, LoadChartData> = {
  'tk-40': {
    craneId: 'tk-40',
    craneName: 'TK 40',
    maxBoomText: 'Mastlänge bis 40m',
    outriggerBaseText: 'Abstützung 7.5m × 6.8m',
    boomLengths: [10.5, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0],
    radii: [3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0, 34.0],
    matrix: [
      // 3.0 m
      [40.0, 32.0, 26.5, null, null, null, null],
      // 4.0 m
      [33.0, 26.7, 24.7, 21.0, null, null, null],
      // 4.5 m
      [30.0, 27.3, 23.2, 19.6, 15.6, null, null],
      // 5.0 m
      [27.3, 26.3, 21.8, 18.5, 15.1, 12.2, null],
      // 6.0 m
      [22.8, 23.0, 19.3, 16.6, 13.9, 11.9, 10.0],
      // 7.0 m
      [18.6, 18.8, 17.3, 15.1, 12.9, 11.6, 9.5],
      // 8.0 m
      [null, 15.6, 15.0, 13.7, 11.8, 10.8, 9.1],
      // 9.0 m
      [null, 12.9, 12.6, 11.9, 11.0, 10.1, 8.6],
      // 10.0 m
      [null, 10.7, 10.9, 10.3, 9.8, 9.5, 8.2],
      // 12.0 m
      [null, 7.8, 8.0, 8.0, 7.6, 7.5, 7.3],
      // 14.0 m
      [null, null, 6.1, 6.2, 6.1, 6.0, 5.9],
      // 16.0 m
      [null, null, 4.8, 4.9, 5.0, 4.9, 4.8],
      // 18.0 m
      [null, null, null, 3.9, 4.0, 3.9, 3.9],
      // 20.0 m
      [null, null, null, 3.2, 3.3, 3.2, 3.2],
      // 22.0 m
      [null, null, null, null, 2.7, 2.7, 2.7],
      // 24.0 m
      [null, null, null, null, 2.2, 2.3, 2.2],
      // 26.0 m
      [null, null, null, null, 1.8, 1.9, 1.9],
      // 28.0 m
      [null, null, null, null, null, 1.5, 1.5],
      // 30.0 m
      [null, null, null, null, null, null, 1.3],
      // 34.0 m
      [null, null, null, null, null, null, 0.9],
    ],
  },
  'tk-60': {
    craneId: 'tk-60',
    craneName: 'TK 60',
    maxBoomText: 'Mastlänge bis 50m',
    outriggerBaseText: 'Abstützung 8.5m × 7.8m',
    boomLengths: [11.5, 16.0, 22.0, 28.0, 34.0, 42.0, 50.0],
    radii: [3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0, 34.0, 38.0],
    matrix: [
      // 3.0 m
      [60.0, 45.0, 36.0, null, null, null, null],
      // 4.0 m
      [50.0, 41.0, 33.5, 27.0, null, null, null],
      // 4.5 m
      [44.0, 38.5, 30.2, 25.0, 19.5, null, null],
      // 5.0 m
      [40.0, 35.0, 28.5, 23.5, 18.8, 14.5, null],
      // 6.0 m
      [33.5, 30.0, 25.0, 21.0, 17.2, 13.8, 10.5],
      // 7.0 m
      [28.0, 26.0, 22.5, 19.0, 15.8, 12.9, 9.8],
      // 8.0 m
      [null, 22.5, 20.0, 17.2, 14.5, 12.0, 9.3],
      // 9.0 m
      [null, 19.0, 17.8, 15.5, 13.4, 11.2, 8.8],
      // 10.0 m
      [null, 16.2, 15.8, 14.1, 12.5, 10.5, 8.4],
      // 12.0 m
      [null, 12.0, 12.5, 11.8, 10.6, 9.2, 7.6],
      // 14.0 m
      [null, null, 9.8, 9.9, 9.2, 8.1, 6.8],
      // 16.0 m
      [null, null, 7.8, 8.0, 7.9, 7.2, 6.1],
      // 18.0 m
      [null, null, null, 6.5, 6.6, 6.3, 5.4],
      // 20.0 m
      [null, null, null, 5.3, 5.4, 5.3, 4.8],
      // 22.0 m
      [null, null, null, null, 4.4, 4.5, 4.2],
      // 24.0 m
      [null, null, null, null, 3.7, 3.8, 3.6],
      // 26.0 m
      [null, null, null, null, 3.1, 3.2, 3.1],
      // 28.0 m
      [null, null, null, null, null, 2.7, 2.6],
      // 30.0 m
      [null, null, null, null, null, 2.2, 2.2],
      // 34.0 m
      [null, null, null, null, null, 1.5, 1.6],
      // 38.0 m
      [null, null, null, null, null, null, 1.1],
    ],
  },
  'mk-30': {
    craneId: 'mk-30',
    craneName: 'MK 30',
    maxBoomText: 'Mastlänge bis 30m',
    outriggerBaseText: 'Abstützung 6.5m × 6.0m',
    boomLengths: [8.5, 12.0, 16.5, 21.0, 25.5, 30.0],
    radii: [3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0],
    matrix: [
      // 3.0 m
      [30.0, 24.0, 18.5, null, null, null],
      // 4.0 m
      [24.5, 20.5, 16.8, 13.5, null, null],
      // 4.5 m
      [22.0, 18.8, 15.5, 12.6, 9.8, null],
      // 5.0 m
      [19.8, 17.2, 14.3, 11.8, 9.3, 7.5],
      // 6.0 m
      [16.2, 14.5, 12.5, 10.4, 8.4, 6.8],
      // 7.0 m
      [13.2, 12.4, 11.0, 9.2, 7.6, 6.2],
      // 8.0 m
      [null, 10.5, 9.8, 8.2, 6.9, 5.6],
      // 9.0 m
      [null, 8.8, 8.5, 7.4, 6.3, 5.1],
      // 10.0 m
      [null, 7.4, 7.5, 6.7, 5.7, 4.6],
      // 12.0 m
      [null, 5.2, 5.5, 5.4, 4.8, 3.9],
      // 14.0 m
      [null, null, 4.1, 4.2, 4.0, 3.3],
      // 16.0 m
      [null, null, 3.1, 3.2, 3.2, 2.7],
      // 18.0 m
      [null, null, null, 2.5, 2.6, 2.2],
      // 20.0 m
      [null, null, null, 1.9, 2.0, 1.8],
      // 22.0 m
      [null, null, null, null, 1.5, 1.4],
      // 24.0 m
      [null, null, null, null, 1.1, 1.1],
      // 26.0 m
      [null, null, null, null, null, 0.8],
    ],
  },
};
