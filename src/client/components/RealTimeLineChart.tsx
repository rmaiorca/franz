import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from "chart.js";
import "chartjs-adapter-luxon";
import { Line } from "react-chartjs-2";
import { GqlChartProps } from "../../../types/types";
import { useQuery } from "@apollo/client";
import ChartStreaming from "chartjs-plugin-streaming";

//https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy - line 143
//https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980 - line 143

// Network data means we are going to fetch new data from promethius and not just cache data. See line 145

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartStreaming
);

export default function RealTimeLineChart({
  query,
  metric,
  duration,
  step,
  pollInterval,
  title,
  xAxisLabel,
  yAxisLabel,
  resource,
  label,
  args,
}: GqlChartProps) {
  const timeNow = useRef(new Date());
  const loaded = useRef(false);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const colors = ["00f5d4", "00bbf9", "9b5de5", "f15bb5", "93c8f7"];

  const options: ChartOptions<"line"> = {
    responsive: true,
    parsing: {
      xAxisKey: "time",
      yAxisKey: metric,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
      streaming: {
        duration: duration * 60000,
        delay: pollInterval * 1000,
        refresh: pollInterval * 1000,
        onRefresh: (chart) => {
          const variables = {
            start: timeNow.current.toString(),
            end: new Date().toString(),
            step: step,
            ...args,
          };
          timeNow.current = new Date(variables.end);
          refetch({ ...variables }).then((result) => {
            if (loaded.current) {
              result.data[resource].forEach((series, index) => {
                series[`${metric}`].forEach((point) => {
                  chart.data.datasets[index].data.push(point);
                });
              });
            }

            chart.update("quiet");
          });
        },
      },
    },
    scales: {
      xAxes: {
        title: {
          display: xAxisLabel ? true : false,
          text: xAxisLabel,
        },
        type: "realtime",
        time: {
          unit: "minute",
          parser: (label: string) => new Date(label).getTime(),
          stepSize: 0.5,
          displayFormats: {
            minute: "HH:mm:ss",
          },
        },
        adapters: {
          date: {
            local: "en-us",
            setZone: true,
          },
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      yAxes: {
        title: {
          display: yAxisLabel ? true : false,
          text: yAxisLabel,
        },
      },
    },
  };

  const { loading, data, refetch } = useQuery(query, {
    variables: {
      start: new Date(
        timeNow.current.valueOf() - duration * 60000 * 2
      ).toString(),
      end: timeNow.current.toString(),
      step: step,
      ...args,
    },
    fetchPolicy: "network-only", // this policy ensures we fetch new data from Prometheus instead of returning the last queried data in the cache
    // this way the chart always displays new metrics in the time series
    // by default useQuery would return cached data first, so we are overriding this to make sure we get fresh data from PRrometheus each time
    nextFetchPolicy: "network-only",
    // ensures the next fetch is also not from the cache
    // required to continue to override defaults of returning cached data after first query
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (loading || loaded.current) return;
    const datasets = [];
    const labels = [];
    data[resource].forEach((series, index) => {
      const seriesData: any = {};
      seriesData.label = `${resource}: ${series[label]}`;
      seriesData.backgroundColor = `#${colors[index]}`;
      seriesData.borderColor = seriesData.backgroundColor;
      seriesData.pointRadius = 0;
      seriesData.tension = 0.2;

      seriesData.data = series[`${metric}`];

      datasets.push(seriesData);
    });

    setChartData({
      labels,
      datasets,
    });

    return () => (loaded.current = true);
  }, [loading]);

  useEffect(() => {
    loaded.current = false;
  }, [args]);

  return (
    <>
      {useMemo(() => {
        return loading && !loaded.current ? (
          <div>Loading...</div>
        ) : (
          <Line options={options} data={chartData} ref={chartRef} />
        );
      }, [chartData])}
    </>
  );
}
