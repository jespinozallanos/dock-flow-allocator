import DockAllocationDashboard from "@/components/DockAllocationDashboard";
const Index = () => {
  return <div className="min-h-screen bg-background relative">
      {/* Header stripe - marine color */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
      
      {/* ASMAR Logo */}
      <div className="absolute top-4 right-8 z-30">
        <img src="/lovable-uploads/28e585db-dc69-49ef-9a3e-937fe48ce44c.png" alt="ASMAR Logo" className="h-16 w-auto" />
      </div>
      
      <div className="relative z-20">
        <DockAllocationDashboard />
      </div>
      
      {/* Footer stripe - marine color */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
    </div>;
};
export default Index;