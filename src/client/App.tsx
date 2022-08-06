import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Dashboard from "./pages/Dashboard";
import Brokers from "./pages/Brokers";
import Topics from "./pages/Topics";
import AddTopic from "./components/AddTopic";
import TopicsList from "./pages/TopicsList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReassignPartitions } from "./components/ReassignPartitions";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { Chart } from "chart.js";
import { Layout } from "./Layout/Layout";
// Create a batch link to have reduce network requests needed to query data

// https://www.apollographql.com/docs/react/api/link/apollo-link-http/
const link = new BatchHttpLink({
  uri: "/graphql",
  batchMax: 6, // no more than 6 operation per batch
  batchInterval: 20, // Wait no more than 20ms after first batched operation
  batchDebounce: true, // If true, the batchInterval timer is reset whenever an operation is added to the batch.
});

// https://www.apollographql.com/docs/react/get-started
// https://www.apollographql.com/docs/react/api/cache/InMemoryCache/
// https://www.apollographql.com/docs/react/caching/cache-configuration/
const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      // broker requires keyFields because unlike cluster it is not known to be singular
      Broker: {
        keyFields: ["brokerId"],
        merge: true,
        // basically merge will take two different queries for the same broker and merge their fields
        // so brokerId 1, cpu usage and disk usage will be merged in cache under brokerId 1
        // https://www.apollographql.com/docs/react/caching/cache-field-behavior/#the-merge-function
        fields: {},
      },
      // cluster doesnt have key fields because it is singular so all queries related to the cluster refer to the same cluster

      Cluster: {
        keyFields: [],
      },
    },
  }),
}); // look to graphQl/datasource/models/promQueries.ts

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    info: {
      main: "#9d5ee1",
    },
  },
});

Chart.defaults.color = darkTheme.palette.text.primary;
Chart.defaults.borderColor = darkTheme.palette.divider;

//`http://localhost:${process?.env.PORT || 3000}/graphql`,

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <ApolloProvider client={client}>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/brokers" element={<Brokers />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/addtopic" element={<AddTopic />} />
              <Route path="/topicslist" element={<TopicsList />} />
              <Route
                path="/reassign/:topicName"
                element={<ReassignPartitions />}
              />
              <Route
                path="*"
                element={
                  <main style={{ padding: "1rem" }}>
                    <p>nothing here!</p>
                  </main>
                }
              />
            </Routes>
          </Layout>
        </ApolloProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
