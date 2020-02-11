<template>
  <div class="row login">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-body">
          <form @submit="submit">
            <div class="form-group">
              <label for="exampleInputEmail1">Username</label>
              <input type="text" class="form-control" id="exampleInputEmail1" v-model="username">
              <!-- <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small> -->
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Password</label>
              <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
            </div>
            <!-- <div class="form-group form-check">
              <input type="checkbox" class="form-check-input" id="exampleCheck1">
              <label class="form-check-label" for="exampleCheck1">Check me out</label>
            </div> -->
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data: () => ({
    username: '',
    password: ''
  }),
  methods: {
    submit (e) {
      e.preventDefault()
      const { username, password } = this
      axios.post('/api/login', { username, password })
      .then(result => {
        window.localStorage.setItem('user-token', result.data.jwtToken)
        this.$router.push('/fm')
      })
      .catch(console.log)
    }
  }
}
</script>

<style>
.login {
  width: 45%;
  margin: auto;
  height: 100vh;
  padding: 96px 0;
}
</style>
