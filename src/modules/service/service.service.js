const { Service } = require("../../config/db.config");

class ServiceService {

    createService = async (data) => {
        try {
            const newService = await Service.create(data);
            return newService;
        } catch (exception) {
            throw exception;
        }

    }
    listAllByFilter = async ({ limit = 10, offset = 0, filter = {} }) => {
        try {
            const total = await Service.count({
                where: filter
            });

            const list = await Service.findAll({
                where: filter,
                order: [['createdAt', 'DESC']], // Sorting by createdAt descending
                limit: limit,
                offset: offset
            });

            return { list, total };
        } catch (exception) {
            throw exception;
        }
    };


    updateService = async (ServiceId, data) => {
        try {
            // First, make sure the Service exists
            const service = await Service.findByPk(ServiceId);

            if (!service) {
                throw { code: 400, message: "Service not found", status: "SERVICE_NOT_FOUND" };
            }

            // Now update the Service with the new data
            const updatedService = await service.update(data);

            return updatedService;

        } catch (exception) {
            throw exception;
        }
    }
    deleteServiceById = async (Service_id) => {

        try {
            const result = await Service.destroy({
                where: {
                    service_id: Service_id // Specify the ID of the Service to delete
                }
            });

            if (result === 0) {
                throw { code: 404, message: "Service already deleted or does not exists.", status: "SERVICE_DELETE_ERROR" };
            }

            return result;

        } catch (exception) {
            throw exception;
        }
    };

}
const serviceSvc = new ServiceService();
module.exports = { serviceSvc };