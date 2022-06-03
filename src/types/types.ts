import { DocumentNode } from "graphql";
import { ChartProps } from "react-chartjs-2";

export interface DefaultErr {
  log: string;
  status: number;
  message: Messsage;
}

export interface Messsage {
  err: string;
}

export interface Broker {
  brokerId: number;
  brokerPort: number;
  brokerHost: string;
  brokerCpuUsage?: BrokerCpuUsage;
  start?: string;
  end?: string;
  step?: string;
}

export interface BrokerCpuUsage {
  cpuUsage: number;
  time: string;
}

export interface DiskUsage extends Metric {
  diskUsage: number;
}

export interface Topic {
  name: string;
  numPartitions: number;
  totalReplicas: number;
  totalIsrs: number;
  brokersWithReplicas: [number];
  logSize: number;
}

export interface Metric {
  time: string;
}

export interface Count extends Metric {
  count: number;
}

export interface Cluster {
  activeController: Broker;
  brokers: Broker[];
  activeControllerCount?: Count;
  offlinePartitionCount?: Count;
}

export interface UnderReplicatedPartitions {
  underReplicatedPartitions: number;
  time: string;
}

export interface GqlChartProps {
  query: DocumentNode;
  metric: string;
  duration: number;
  step: string;
  pollInterval?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}
