import { 
  Bhandara, 
  Organizer, 
  Review, 
  Report, 
  AuditLog, 
  User, 
  AdminMetrics, 
  CityInfo, 
  FilterParams 
} from '../types/index.js';

class ApiService {
  private currentUserId: string = 'usr_devotee';
  private currentUserRole: string = 'USER';
  private currentUserName: string = 'Pooja Sharma';

  public setUserContext(user: { id: string; role: string; name: string }) {
    this.currentUserId = user.id;
    this.currentUserRole = user.role;
    this.currentUserName = user.name;
    localStorage.setItem('annsetu_user_id', user.id);
    localStorage.setItem('annsetu_user_role', user.role);
    localStorage.setItem('annsetu_user_name', user.name);
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': localStorage.getItem('annsetu_user_id') || this.currentUserId,
      'x-user-role': localStorage.getItem('annsetu_user_role') || this.currentUserRole,
      'x-user-name': localStorage.getItem('annsetu_user_name') || this.currentUserName,
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: any; message?: string }> {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error(`API Error on ${url}:`, err);
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' }
      };
    }
  }

  // --- Bhandaras ---
  public async getBhandaras(params?: FilterParams & { lat?: number; lng?: number; includePending?: boolean }): Promise<Bhandara[]> {
    const searchParams = new URLSearchParams();
    if (params?.lat !== undefined) searchParams.set('lat', params.lat.toString());
    if (params?.lng !== undefined) searchParams.set('lng', params.lng.toString());
    if (params?.distance) searchParams.set('distance', params.distance.toString());
    if (params?.city) searchParams.set('city', params.city);
    if (params?.locality) searchParams.set('locality', params.locality);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.date) searchParams.set('dateFilter', params.date);
    if (params?.verification) searchParams.set('verification', params.verification);
    if (params?.foodType) searchParams.set('foodType', params.foodType);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.includePending) searchParams.set('includePending', 'true');

    const res = await this.request<Bhandara[]>(`/api/bhandaras?${searchParams.toString()}`);
    return res.data || [];
  }

  public async getBhandara(idOrSlug: string, lat?: number, lng?: number): Promise<Bhandara | null> {
    const searchParams = new URLSearchParams();
    if (lat !== undefined) searchParams.set('lat', lat.toString());
    if (lng !== undefined) searchParams.set('lng', lng.toString());

    const res = await this.request<Bhandara>(`/api/bhandaras/${encodeURIComponent(idOrSlug)}?${searchParams.toString()}`);
    return res.data || null;
  }

  public async getReviews(id: string): Promise<Review[]> {
    const res = await this.request<Review[]>(`/api/bhandaras/${id}/reviews`);
    return res.data || [];
  }

  public async createBhandara(payload: any): Promise<{ success: boolean; data?: Bhandara; duplicateWarning?: any; message?: string; error?: any }> {
    return this.request<Bhandara>('/api/bhandaras', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async updateBhandara(id: string, updates: any): Promise<boolean> {
    const res = await this.request<Bhandara>(`/api/bhandaras/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return !!res.success;
  }

  public async confirmHappening(id: string, isHappening: boolean, note?: string): Promise<{ success: boolean; data?: Bhandara; message?: string }> {
    return this.request<Bhandara>(`/api/bhandaras/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ isHappening, note })
    });
  }

  public async submitReview(id: string, review: {
    overallRating: number;
    infoAccuracyRating: number;
    locationAccuracyRating: number;
    timingAccuracyRating: number;
    comments: string;
    attended: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    return this.request(`/api/bhandaras/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  public async reportBhandara(id: string, reason: string, details: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/api/bhandaras/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, details })
    });
  }

  public async toggleSave(id: string): Promise<boolean> {
    const res = await this.request<{ isSaved: boolean }>(`/api/bhandaras/${id}/save`, {
      method: 'POST'
    });
    return !!res.data?.isSaved;
  }

  public async trackEvent(id: string, action: 'view' | 'share' | 'directions'): Promise<void> {
    await this.request(`/api/bhandaras/${id}/track`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  public async getSavedBhandaras(): Promise<Bhandara[]> {
    const res = await this.request<Bhandara[]>('/api/saved');
    return res.data || [];
  }

  public async getMySubmissions(): Promise<Bhandara[]> {
    const res = await this.request<Bhandara[]>('/api/my-submissions');
    return res.data || [];
  }

  // --- Cities ---
  public async getCities(): Promise<CityInfo[]> {
    const res = await this.request<CityInfo[]>('/api/cities');
    return res.data || [];
  }

  // --- Organizers ---
  public async getOrganizers(): Promise<Organizer[]> {
    const res = await this.request<Organizer[]>('/api/organizers');
    return res.data || [];
  }

  public async getOrganizer(id: string): Promise<Organizer & { events: Bhandara[] } | null> {
    const res = await this.request<Organizer & { events: Bhandara[] }>(`/api/organizers/${id}`);
    return res.data || null;
  }

  // --- AI Poster OCR ---
  public async parsePoster(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{ success: boolean; data?: any; error?: string; message?: string; fallbackMessage?: string }> {
    const res = await this.request<any>('/api/ai/parse-poster', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType })
    });
    return res;
  }

  // --- Admin ---
  public async getAdminMetrics(): Promise<AdminMetrics | null> {
    const res = await this.request<AdminMetrics>('/api/admin/metrics');
    return res.data || null;
  }

  public async getAdminStats(): Promise<any> {
    const res = await this.request<any>('/api/admin/metrics');
    return res.data || null;
  }

  public async getPendingSubmissions(): Promise<Bhandara[]> {
    const res = await this.request<Bhandara[]>('/api/admin/moderation');
    return res.data || [];
  }

  public async getAdminPending(): Promise<Bhandara[]> {
    return this.getPendingSubmissions();
  }

  public async moderateBhandara(id: string, action: 'APPROVE' | 'REJECT' | 'VERIFY' | 'CANCEL' | 'DELETE', reason?: string): Promise<{ success: boolean; message?: string }> {
    const res = await this.request(`/api/admin/bhandaras/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
    return { success: !!res.success, message: res.message };
  }

  public async mergeDuplicates(targetId: string, duplicateId: string): Promise<boolean> {
    const res = await this.request('/api/admin/bhandaras/merge', {
      method: 'POST',
      body: JSON.stringify({ targetId, duplicateId })
    });
    return !!res.success;
  }

  public async getReports(status?: string): Promise<Report[]> {
    const query = status ? `?status=${status}` : '';
    const res = await this.request<Report[]>(`/api/admin/reports${query}`);
    return res.data || [];
  }

  public async getAdminReports(status?: string): Promise<Report[]> {
    return this.getReports(status);
  }

  public async resolveReport(id: string, action: 'RESOLVED' | 'DISMISSED'): Promise<{ success: boolean; message?: string }> {
    const res = await this.request(`/api/admin/reports/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    return { success: !!res.success, message: res.message };
  }

  public async verifyOrganizer(id: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED'): Promise<boolean> {
    const res = await this.request(`/api/admin/organizers/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    return !!res.success;
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    const res = await this.request<AuditLog[]>('/api/admin/audit-logs');
    return res.data || [];
  }

  public async getAdminAuditLogs(): Promise<AuditLog[]> {
    return this.getAuditLogs();
  }

  // --- Auth & Users ---
  public async getCurrentUser(): Promise<User> {
    const res = await this.request<User>('/api/auth/me');
    return res.data || {
      id: 'usr_devotee',
      email: 'devotee@annsetu.in',
      name: 'Pooja Sharma',
      role: 'USER',
      createdAt: new Date().toISOString()
    };
  }

  public async getAllUsers(): Promise<User[]> {
    const res = await this.request<User[]>('/api/auth/users');
    return res.data || [];
  }

  public async switchRole(role: string, userId?: string): Promise<User> {
    const res = await this.request<User>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role, userId })
    });
    if (res.data) {
      this.setUserContext(res.data);
    }
    return res.data!;
  }
}

export const api = new ApiService();
