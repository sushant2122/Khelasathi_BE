const bcrypt = require("bcryptjs");

async function seedAdminUser(userModel, roleModel) {
    try {
        // 🔐 Hash the password
        const password = bcrypt.hashSync("admin", 10);

        // 🔍 Find the Admin role
        const adminRole = await roleModel.findOne({
            where: { title: 'Admin' }
        });


        if (!adminRole) {
            throw new Error("❌ Admin role not found. Please ensure roles are seeded first.");
        }

        // 🔍 Check if an admin user already exists (based on role_id)
        const existingAdmin = await userModel.findOne({
            where: { role_id: adminRole.role_id }
        });

        if (existingAdmin) {
            throw new Error("⚠️ Admin user already exists. Seeding aborted.");
        }

        // ✅ Create the admin user
        await userModel.create({
            full_name: 'Sushant Paudyal',
            email: 'sushantpaudyal@gmail.com',
            password: password,
            address: 'Kausalthar, Bhaktapur',
            role_id: adminRole.role_id,
            is_verified: true,
            contact_number: '9861200112',
            profile_img: 'https://res.cloudinary.com/dbvyoelj5/image/upload/v1740502396/khelasathi/yxsfapk54vbh42ve958b.jpg',
            date_joined: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('✅ Admin user seeded successfully!');
    } catch (error) {
        // console.error('❌ Error seeding admin user:', error.message);
    }
}

module.exports = { seedAdminUser };
