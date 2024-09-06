/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('posts', function(table){
      table.increments()
      table.string('description').notNullable()
      table.string('userid').notNullable()
      table.integer('postid')
      
      table.foreign('userid').references('id').inTable('users')
      table.foreign('postid').references('id').inTable('posts')
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('posts')
};
