import Navbar from "@/components/layout/Navbar";
import {
  Brain,
  Database,
  Shield,
  GitFork,
  Server,
  Code,
  Layers,
  Target,
  CheckCircle,
} from "lucide-react";

const technologies = [
  { name: "React.js", category: "Frontend", icon: Code },
  { name: "FastAPI", category: "Backend", icon: Server },
  { name: "XGBoost", category: "ML Framework", icon: Brain },
  { name: "PostgreSQL", category: "Database", icon: Database },
  { name: "SHAP / LIME", category: "Explainability", icon: Layers },
  { name: "GIT", category: "Version Control", icon: GitFork },
];

const objectives = [
  "Develop a real-time fraud detection system using machine learning",
  "Implement explainable AI techniques (SHAP/LIME) for model interpretability",
  "Create an intuitive dashboard for transaction monitoring and analysis",
  "Achieve high accuracy (>95%) in fraud detection with minimal false positives",
  "Enable batch and real-time prediction capabilities",
  "Provide comprehensive reporting and visualization tools",
];

const About = () => {
  return (
    
    <div className="space-y-8 animate-fade-in">
      {/* Header */
         <Navbar />
      }
      <div>
        <h1 className=" pt-9 text-3xl font-bold text-foreground">About the Project</h1>
        <p className="text-muted-foreground mt-1">
          Final Year Engineering Project - AI-Based Fraud Detection System
        </p>
      </div>

      {/* Problem Statement */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-fraud/10">
            <Target className="h-5 w-5 text-fraud" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Problem Statement</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Financial fraud has become increasingly sophisticated, causing billions of dollars in losses annually. 
          Traditional rule-based systems struggle to keep pace with evolving fraud patterns. This project addresses 
          the need for an intelligent, adaptive fraud detection system that can analyze transaction patterns in 
          real-time, identify anomalies, and provide explainable decisions to help analysts understand and act 
          on potential threats.
        </p>
      </div>

      {/* Objectives */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Project Objectives</h2>
        </div>
        <ul className="grid md:grid-cols-2 gap-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-accent">{index + 1}</span>
              </div>
              <span className="text-muted-foreground">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Technologies */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <Code className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Technologies Used</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="p-4 bg-muted/50 rounded-lg text-center hover:bg-muted transition-colors"
              >
                <Icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="font-medium text-foreground text-sm">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">System Architecture</h2>
        </div>

        <div className="relative">
          {/* Architecture Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Data Layer */}
            <div className="p-4 bg-accent/5 border-2 border-accent/20 rounded-xl">
              <h3 className="font-semibold text-accent mb-3">Data Layer</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Transaction Database</li>
                <li>• User Profiles</li>
                <li>• Historical Data</li>
                <li>• Real-time Streams</li>
              </ul>
            </div>

            {/* Processing Layer */}
            <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
              <h3 className="font-semibold text-primary mb-3">Processing Layer</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Data Preprocessing</li>
                <li>• Feature Engineering</li>
                <li>• Normalization</li>
                <li>• Batch Processing</li>
              </ul>
            </div>

            {/* ML Layer */}
            <div className="p-4 bg-warning/5 border-2 border-warning/20 rounded-xl">
              <h3 className="font-semibold text-warning mb-3">ML Layer</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fraud Detection Model</li>
                <li>• Anomaly Detection</li>
                <li>• SHAP Explainer</li>
                <li>• Model Inference</li>
              </ul>
            </div>

            {/* Presentation Layer */}
            <div className="p-4 bg-success/5 border-2 border-success/20 rounded-xl">
              <h3 className="font-semibold text-success mb-3">Presentation Layer</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• React Dashboard</li>
                <li>• Real-time Charts</li>
                <li>• Alert System</li>
                <li>• Reports & Export</li>
              </ul>
            </div>
          </div>

         
          
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-gradient-to-r from-primary to-accent/80 p-6 rounded-xl text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Final Year Engineering Project</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Project Title</p>
            <p className="font-medium">AI-Based Fraud & Anomaly Detection System</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">Domain</p>
            <p className="font-medium">Machine Learning & Financial Security</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">Year</p>
            <p className="font-medium">2025-2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
