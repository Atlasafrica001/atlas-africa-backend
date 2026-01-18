import waitlistService from './waitlist.service';
import consultationService from './consultation.service';
import blogService from './blog.service';

export class AdminService {
  async getStats() {
    const consultations = await consultationService.getStats();
    const waitlist = await waitlistService.getStats();
    const blog = await blogService.getStats();

    return {
      consultations,
      waitlist,
      blog,
      services: {
        active: 6,  // Hardcoded as per frontend
        total: 6,
      },
    };
  }
}

export default new AdminService();
