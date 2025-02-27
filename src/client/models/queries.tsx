import { gql } from "@apollo/client";

//These are the FE graphql queries - connects to Apollo to get data
//Aliases in graphql - https://blog.logrocket.com/using-aliases-graphql/

export const DASHBOARD_CARD_METRICS_QUERY = gql`
  query Cluster {
    cluster {
      activeControllerCount {
        count: metric
      }
      offlinePartitionCount {
        count: metric
      }
      numberUnderReplicatedPartitions {
        underReplicatedPartitions: metric
      }
    }
  }
`;

//originally broker_metric_query
export const TOPIC_DATAGRID_QUERY = gql`
  query Topics {
    topics {
      name
      numPartitions
      totalReplicas
      totalIsrs
      logSize
    }
    cluster {
      deleteTopic
    }
  }
`;

export const TOPIC_PAGE_QUERY = gql`
  query Cluster {
    cluster {
      underMinIsr {
        metric
      }
    }
    topics {
      logSize
    }
  }
`;

export const TOPIC_QUERY = gql`
  query Topic($name: String!) {
    topic(name: $name) {
      name
      partitions {
        partitionId
        leader {
          brokerId
        }
        replicas {
          brokerId
        }
      }
    }
  }
`;

//Add additional query for metrics on broker page only

export const ALL_BROKER_CPU_USAGE = gql`
  query BrokersCPUUsage($start: String, $end: String, $step: String) {
    broker: brokers(start: $start, end: $end, step: $step) {
      brokerId
      cpuUsage: cpuUsageOverTime {
        cpuUsage: metric
        time
      }
    }
  }
`;

export const ALL_BROKER_DISK_USAGE = gql`
  query BrokersJVMMemoryUsage($start: String, $end: String, $step: String) {
    broker: brokers(start: $start, end: $end, step: $step) {
      brokerId
      JVMMemoryUsage: JVMMemoryUsageOverTime {
        JVMMemoryUsage: metric
        time
      }
    }
  }
`;

export const BROKER_FRAGMENT = gql`
  fragment CoreBrokerFields on Broker {
    brokerId
    brokerPort
    brokerHost
  }
`;

export const CORE_ALL_BROKERS_QUERY = gql`
  ${BROKER_FRAGMENT}
  query Brokers {
    brokers {
      ...CoreBrokerFields
    }
  }
`;

export const ALL_BROKERS_TIME_MS = gql`
  ${BROKER_FRAGMENT}
  query BrokerTimeMs {
    brokers {
      produceTotalTimeMs {
        totalTimeMs: metric
        time
      }
      consumerTotalTimeMs {
        totalTimeMs: metric
        time
      }
      followerTotalTimeMs {
        totalTimeMs: metric
        time
      }
      ...CoreBrokerFields
    }
  }
`;

export const AVERAGE_TOTALTIMEMS = gql`
  query totalTimeMs($request: String!, $brokerIds: [Int]) {
    totalTimeMs(request: $request, brokerIds: $brokerIds) {
      totalTimeMs: metric
      time
    }
  }
`;

export const BYTES_IN_PER_SECOND = gql`
  query BytesInPerSecondOverTime(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    # topic is an alias for bytesInPerSecondOverTime
    topic: bytesInPerSecondOverTime(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      # this topic is not an alias
      topic
      # bytesInPerSecond and alias for values
      bytesInPerSecond: values {
        time
        # bytesInPerSecond is an alias for metric
        bytesInPerSecond: metric
      }
    }
  }
`;

export const BYTES_OUT_PER_SECOND = gql`
  query BytesOutPerSecondOverTime(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    topic: bytesOutPerSecondOverTime(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      topic
      bytesOutPerSecond: values {
        time
        bytesOutPerSecond: metric
      }
    }
  }
`;

export const MESSAGES_IN_PER_SEC = gql`
  query MessagesInPerSec(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    topic: messagesInPerSec(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      topic
      messagesInPerSecond: values {
        time
        messagesInPerSecond: metric
      }
    }
  }
`;

export const ADD_TOPIC = gql`
  mutation AddTopic(
    $name: String!
    $replicationFactor: Int
    $numPartitions: Int
  ) {
    addTopic(
      name: $name
      replicationFactor: $replicationFactor
      numPartitions: $numPartitions
    ) {
      name
    }
  }
`;

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($name: String!) {
    deleteTopic(name: $name) {
      name
    }
  }
`;

export const REASSIGN_PARTITIONS = gql`
  mutation ReassignPartitions($topics: [PartitionReassignment]) {
    reassignPartitions(topics: $topics) {
      name
    }
  }
`;

export const UNDERMIN_ISR = gql`
  query UnderMinIsr(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    topic: underMinIsr(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      topic
      underMinIsr: values {
        time
        underMinIsr: metric
      }
    }
  }
`;

export const UNDERREPLICATED_PARTITIONS = gql`
  query UnderreplicatedPartitions(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    topic: underreplicatedPartitions(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      topic
      underreplicatedPartitions: values {
        time
        underreplicatedPartitions: metric
      }
    }
  }
`;

export const TOTAL_LOG_SIZE = gql`
  query LogSize(
    $start: String!
    $end: String!
    $step: String!
    $brokerIds: [Int]
  ) {
    topic: logSize(
      start: $start
      end: $end
      step: $step
      brokerIds: $brokerIds
    ) {
      topic
      logSize: values {
        time
        logSize: metric
      }
    }
  }
`;
