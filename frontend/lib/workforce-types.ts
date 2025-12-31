export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FULL_DAY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type HoursCardStatus = 'PENDING' | 'SIGNED' | 'APPROVED' | 'REJECTED';

export interface BusinessStaff {
  id: string;
  business: string;
  user: string | null;
  name: string;
  staff_id: string;
  job_title: string;
  department: string;
  employment_type: EmploymentType;
  status: StaffStatus;
  email: string;
  phone: string;
  hourly_rate: string | null;
  hire_date: string;
  termination_date: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  invitation_status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  invitation_responded_at?: string | null;
}

export interface ClockInParams {
  staff_id?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  timezone_offset?: number;
  date?: string;
  clock_in_time?: string;
  clock_out_time?: string;
}


export interface Shift {
  id: string;
  business: string;
  staff: string;
  name: string;
  shift_type: ShiftType;
  day_of_week: DayOfWeek;
  start_time: string;
  ordering: string;
  end_time: string;
  break_duration: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HoursCard {
  id: string;
  staff: string;
  staff_name?: string;
  shift: string | null;
  date: string;
  clock_in: string;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;
  notes: string;

  clock_in_latitude?: string | null;
  clock_in_longitude?: string | null;
  clock_in_distance_meters?: number | null;
  clock_in_datetime?: string;
  clock_out_datetime?: string;

  clocked_in_by?: string | null;
  clocked_in_by_name?: string | null;
  clocked_out_by?: string | null;
  clocked_out_by_name?: string | null;

  clock_in_display?: string;
  clock_out_display?: string;
  worker_signature?: string;
  worker_signed_at?: string | null;
  is_signed?: boolean;
  is_clocked_out?: boolean;


  status: HoursCardStatus;
  approved_by: string | null;
  approved_by_name?: string | null;
  approved_at: string | null;
  rejection_reason: string;

  created_at: string;
  updated_at: string;
  total_hours?: string | null;
  total_hours_decimal: number;
  is_approved: boolean;
}

export interface StaffFormData {
  name: string;
  job_title: string;
  business?: string;
  department: string;
  employment_type: EmploymentType;
  status: StaffStatus;
  email: string;
  phone: string;
  hourly_rate?: string;
  hire_date?: string;
  user?: string;
}

export interface ShiftFormData {
  staff: string[];
  name: string;
  shift_type: ShiftType;
  day_of_week: DayOfWeek[];
  start_time: string;
  end_time: string;
  break_duration?: string;
  is_active: boolean;
}

export interface HoursCardFormData {
  staff: string;
  shift?: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StaffFilters {
  search: string;
  status: StaffStatus | '';
  employment_type: EmploymentType | '';
  department: string;
}

export interface ShiftFilters {
  search: string;
  staff: string;
  day_of_week: DayOfWeek | '';
  shift_type: ShiftType | '';
}

export interface HoursCardFilters {
  search: string;
  staff: string;
  status: HoursCardStatus | '';
  date_from: string;
  date_to: string;
}
