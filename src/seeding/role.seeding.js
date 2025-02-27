async function seedRoles(roleModel) {
    try {
        const existingRoles = await roleModel.findAll();

        // Only insert if there are no existing roles
        if (existingRoles.length === 0) {
            await roleModel.bulkCreate([
                {
                    role_title: 'Admin',
                    description: 'Administrator role with all permissions',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    role_title: 'Venue',
                    description: 'Venue role with permission to manage bookings',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    role_title: 'Player',
                    description: 'Player role with permission to book and play futsal',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ]);

            console.log('✅ Roles seeded successfully!');
        } else {
            // console.log('Roles already exist in the database.');
        }
    } catch (error) {
        console.error('Error seeding roles:', error);
    }
}

module.exports = { seedRoles };
