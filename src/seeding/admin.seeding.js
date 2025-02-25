const bcrypt = require("bcryptjs");
async function seedAdminUser(userModel, roleModel) {
    try {
        const password = bcrypt.hashSync("admin", 10);
        // Find the Admin role
        const adminRole = await roleModel.findOne({
            where: { title: 'Admin' }
        });

        if (!adminRole) {
            console.error("Admin role not found. Please ensure roles are seeded first.");
            return;
        }

        // Check if the admin user already exists
        const existingAdmin = await userModel.findOne({
            where: { email: 'admin@example.com' }
        });

        if (existingAdmin) {
            console.log("Admin user already exists.");
        } else {
            // Create the admin user
            await userModel.create({
                full_name: 'Sushant paudyal',
                email: 'sushantpaudyal@gmail.com',
                password: password, // Be sure to hash this password in production
                address: 'Kausalthar, bhaktapur',
                role_id: adminRole.role_id, // Assign the Admin role to this user
                is_verified: true,
                contact_number: '9861200112',
                date_joined: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ Admin user seeded successfully!');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
}

module.exports = { seedAdminUser };
