/**
 * Types and interfaces for the Scrcpy remote screen mirroring simulator.
 */

export interface SimulationState {
  isPowerOn: boolean;
  usbConnected: boolean;
  scrcpyRunning: boolean;
  currentCoordinate: { x: number; y: number } | null;
  simulatedTap: { x: number; y: number; id: number } | null;
  latencyMs: number;
  fps: number;
  bitrateKbps: number;
  systemLogs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "adb";
  message: string;
}

export interface CodeTemplate {
  title: string;
  language: string;
  filename: string;
  description: string;
  code: string;
}

export interface BlindStep {
  step: number;
  title: string;
  instruction: string;
  talkbackFeedback: string;
  keyAction: string;
  successCondition: string;
}

export interface DiagnosticItem {
  id: string;
  title: string;
  symptom: string;
  reason: string;
  commands: string[];
  solution: string;
}

export interface BrandStepDetail {
  number: number;
  title: string;
  desc: string;
  keyAction?: string;
  command?: string;
}

export interface BrandRecoveryGuide {
  id: string;
  brand: string;
  title: string;
  recoveryType: string;
  difficulty: "সহজ" | "মাঝারি" | "কঠিন";
  summary: string;
  steps: BrandStepDetail[];
  prerequisites: string[];
  hardwareRequired: string[];
}

export type ADBConnectionState = 'IDLE' | 'SCANNING' | 'UNAUTHORIZED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface ADBDevice {
  id: string;
  state: 'device' | 'unauthorized' | 'offline';
  model?: string;
}

