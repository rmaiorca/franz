import request from "supertest";

const server = "http://localhost:3000";

describe("REST Server", () => {
  describe("404s for non-existant routes", () => {
    it("Bad GET Request", () => {
      return request(server).get("/badRoute").expect(404);
    });

    it("Bad POST Request", () => {
      return request(server).post("/badRoute").expect(404);
    });

    it("Bad PUT Request", () => {
      return request(server).put("/badRoute").expect(404);
    });

    it("Bad DELETE Request", () => {
      return request(server).delete("/badRoute").expect(404);
    });
  });
});

describe("GraphQL Queries", () => {
  describe("Cluster Queries", () => {
    it("A query for the cluster type can return the active controller count which is an object with a time field and number.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            activeControllerCount {
              count
              time
            }
          }
        }`,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.cluster).toHaveProperty("activeControllerCount");
      expect(result.data.cluster.activeControllerCount).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          time: expect.any(String),
        })
      );
    });

    it("A query for the cluster type can return the list of brokers in the cluster.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            brokers {
              brokerHost
              brokerId
              brokerPort
              brokerCpuUsage {
                cpuUsage
                time
              }
              numberUnderReplicatedPartitions {
                  underReplicatedPartitions
                  time
                }
            }
          }
        }`,
      });

      expect(Array.isArray(result.data.cluster.brokers)).toBeTruthy();
      expect(result.data.cluster.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            brokerCpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });

    it("A query for the cluster type can return information about which broker is the active controller.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            brokers {
            brokerHost
            brokerId
            brokerPort
            brokerCpuUsage {
              cpuUsage
              time
            }
            numberUnderReplicatedPartitions {
                underReplicatedPartitions
                time
              }
            }
          }
        }`,
      });

      expect(Array.isArray(result.data.cluster.brokers)).toBeTruthy();
      expect(result.data.cluster.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            brokerCpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });
  });

  describe("Broker Queries", () => {
    it("A query for a valid broker will have fields: brokerId: Int!, brokerPort: Int!, brokerHost: String!, brokerCpuUsage: BrokerCpuUsage, numberUnderReplicatedPartitions.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Broker($brokerId: Int!) {
          broker(brokerId: $brokerId) {
              brokerCpuUsage {
                cpuUsage
                time
              }
              numberUnderReplicatedPartitions {
                underReplicatedPartitions
                time
              }
              brokerHost
              brokerPort
              brokerId
            }
          }`,
        variables: { brokerId: 1 },
      });

      expect(result.errors).toBeUndefined();
      expect(typeof result.data.broker.brokerId).toBe("number");
      expect(typeof result.data.broker.brokerHost).toBe("string");
      expect(typeof result.data.broker.brokerPort).toBe("number");
      expect(typeof result.data.broker.brokerCpuUsage.cpuUsage).toBe("number");
      expect(typeof result.data.broker.brokerCpuUsage.time).toBe("string");
      expect(
        typeof result.data.broker.numberUnderReplicatedPartitions
          .underReplicatedPartitions
      ).toBe("number");
      expect(
        typeof result.data.broker.numberUnderReplicatedPartitions.time
      ).toBe("string");
    });

    it("A query for brokers will be an array of brokers", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Brokers {
          brokers {
            brokerHost
            brokerId
            brokerPort
            brokerCpuUsage {
              cpuUsage
              time
            }
            numberUnderReplicatedPartitions {
                underReplicatedPartitions
                time
              }
          }
        }`,
      });

      expect(Array.isArray(result.data.brokers)).toBeTruthy();
      expect(result.data.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            brokerCpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });
  });
});
