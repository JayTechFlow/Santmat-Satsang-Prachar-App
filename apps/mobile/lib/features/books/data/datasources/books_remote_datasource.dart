import '../models/books_dto.dart';

abstract class BookRemoteDataSource {
  Future<List<BookDto>> getAll();
  Future<BookDto?> getById(String id);
  Future<void> add(BookDto item);
  Future<void> update(BookDto item);
  Future<void> delete(String id);
}
