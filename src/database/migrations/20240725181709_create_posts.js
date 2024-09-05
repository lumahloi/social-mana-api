/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('posts', function(table){
      table.increments()
      table.string('description').notNullable()
      table.string('userid').notNullable()
      table.integer('themeid').notNullable()
      
      table.foreign('userid').references('id').inTable('users')
      table.foreign('themeid').references('id').inTable('themes')
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('posts')
};
