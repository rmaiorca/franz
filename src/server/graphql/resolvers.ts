import * as brokerData from "./datasources/brokerAdmin";
import {
  Broker,
  BrokerCpuUsage,
  UnderReplicatedPartitions,
  Cluster,
  ActiveControllerCount,
} from "../../types/types";

/**
 * TODO: Throw graphql errors from catch statements.
 * TODO: Refactor prometheusAPI to take brokerId to avoid fetching all data and then needing to filter
 */

const resolvers = {
  Broker: {
    brokerCpuUsage: async (
      parent,
      args,
      { dataSources }
    ): Promise<BrokerCpuUsage> => {
      try {
        const brokerCpu = await dataSources.prometheusAPI.getBrokerCpuUsage();
        const singleBrokerCpu = brokerCpu.filter(
          (elem) => elem.brokerId === parent.brokerId
        )[0];
        return singleBrokerCpu;
      } catch (error) {
        console.log(`An error occured with Query Broker CPU Usage: ${error}`);
      }
    },

    numberUnderReplicatedPartitions: async (
      parent,
      args,
      { dataSources }
    ): Promise<UnderReplicatedPartitions> => {
      try {
        const totalUnderReplicatedPartitions =
          await dataSources.prometheusAPI.getUnderReplicatedPartitions();
        const brokerUnderReplicatedPartitions =
          totalUnderReplicatedPartitions.filter(
            (elem) => elem.brokerId === parent.brokerId
          )[0];

        return brokerUnderReplicatedPartitions;
      } catch (error) {
        console.log(
          `An error occured with Query Broker numberUnderReplicatedPartitions: ${error}`
        );
      }
    },
  },

  Cluster: {
    activeControllerCount: async (
      parent,
      args,
      { dataSources }
    ): Promise<ActiveControllerCount> => {
      const activeControllerCount =
        await dataSources.prometheusAPI.getActiveControllerCount();
      const metric: ActiveControllerCount = {
        count: activeControllerCount.reduce(
          (prev, curr) => (prev += curr.activeControllerCount),
          0
        ),
        time: activeControllerCount[0].time,
      };
      return metric;
    },
  },

  Query: {
    brokers: async (): Promise<Broker[]> => {
      const clusterInfo = await brokerData.getClusterInfo();
      return clusterInfo.brokers;
    },

    broker: async (parent: Broker, { brokerId }): Promise<Broker> => {
      try {
        const cluster = await brokerData.getClusterInfo();
        const broker = cluster.brokers.filter(
          (elem) => elem.brokerId === brokerId
        )[0];

        return broker;
      } catch (error) {
        console.log(`An error occured with Query Broker: ${error}`);
      }
    },

    cluster: async (): Promise<Cluster> => {
      const clusterInfo = await brokerData.getClusterInfo();
      return clusterInfo;
    },
  },
};

export default resolvers;
