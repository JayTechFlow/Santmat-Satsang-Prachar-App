import '../entities/books_entity.dart';

abstract class BookRepository {
  Future<List<Book>> getAll();
  Future<Book?> getById(String id);
  Future<void> add(Book item);
  Future<void> update(Book item);
  Future<void> delete(String id);
}
