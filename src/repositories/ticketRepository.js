class TicketRepository {
  constructor(ticketDAO) {
    this.ticketDAO = ticketDAO;
  }

  async createTicket(data) {
    return await this.ticketDAO.createTicket(data);
  }
}

export default new TicketRepository();