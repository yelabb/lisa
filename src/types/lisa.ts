export type LisaState = 
  | 'idle' 
  | 'thinking' 
  | 'success' 
  | 'celebration' 
  | 'struggle' 
  | 'encouraging' 
  | 'reading'
  | 'surprised';

export interface LisaMessage {
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
