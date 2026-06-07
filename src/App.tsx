import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import UmbrellaList from "@/pages/UmbrellaList";
import UmbrellaDetail from "@/pages/UmbrellaDetail";
import StagnationList from "@/pages/StagnationList";
import CompletionPage from "@/pages/CompletionPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<UmbrellaList />} />
          <Route path="/umbrella/:id" element={<UmbrellaDetail />} />
          <Route path="/stagnation" element={<StagnationList />} />
          <Route path="/completion" element={<CompletionPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
