import z from "zod";

export const MedicalReportSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  filename: z.string(),
  file_size: z.number(),
  file_type: z.string(),
  r2_key: z.string(),
  analysis_status: z.string(),
  analysis_data: z.string().nullable(),
  upload_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MedicalReport = z.infer<typeof MedicalReportSchema>;

export const OrganMetricSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  report_id: z.number().nullable(),
  organ_type: z.string(),
  metric_name: z.string(),
  metric_value: z.string(),
  health_score: z.number().nullable(),
  status: z.string().nullable(),
  trend: z.string().nullable(),
  recorded_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type OrganMetric = z.infer<typeof OrganMetricSchema>;

export const ChatMessageSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  role: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const UploadRequestSchema = z.object({
  filename: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

export const ChatRequestSchema = z.object({
  message: z.string(),
});

export const ChatResponseSchema = z.object({
  response: z.string(),
});

export type OrganData = {
  name: string;
  color: string;
  currentHealth: number;
  metrics: Array<{
    name: string;
    value: string;
    status: string;
    trend: string;
  }>;
  yearlyData: Array<{
    year: string;
    health: number;
    [key: string]: any;
  }>;
  monthlyData: Array<{
    month: string;
    health: number;
    [key: string]: any;
  }>;
};
